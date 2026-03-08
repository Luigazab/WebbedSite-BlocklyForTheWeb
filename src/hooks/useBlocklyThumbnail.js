import { useState } from "react";
import { supabase } from "../supabaseClient";

export function useBlocklyThumbnail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveThumbnail = async (workspace, projectId) => {
    setLoading(true);
    setError(null);

    try {
      const svgElement = workspace.getCanvas();
      if (!svgElement) throw new Error('No SVG canvas found');

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);

      const bBox = svgElement.getBBox();
      const viewBox = `${bBox.x} ${bBox.y} ${bBox.width} ${bBox.height}`;
      
      const fullSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" 
             viewBox="${viewBox}" 
             width="${bBox.width}" 
             height="${bBox.height}">
          ${svgString}
        </svg>
      `;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const padding = 20;
      canvas.width = bBox.width + padding * 2;
      canvas.height = bBox.height + padding * 2;

      const img = new Image();
      const svgBlob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const blob = await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, padding, padding);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
          }, 'image/png');
          URL.revokeObjectURL(url);
        };
        img.onerror = (e) => {
          reject(new Error('Image load failed: ' + e.message));
          URL.revokeObjectURL(url);
        };
        img.src = url;
      });

      const fileName = `workspace_snapshots/${projectId}_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('projects')
        .update({ thumbnail_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (dbError) throw dbError;

      setLoading(false);
      return publicUrl;
    } catch (err) {
      console.error('Thumbnail generation failed:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { saveThumbnail, loading, error };
}