
export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    // ========== HTML SECTION ==========
    {
      kind: 'sep'
    },
    {
      kind: 'toolboxlabel',
      name: 'HTML',
      colour: '#000000',
      cssconfig: {
        label: 'customLabel'
      }
    },
    {
      kind: 'category',
      name: 'Page',
      colour: '#FF8500',
      contents: [
        { kind: 'block', type: 'html_doctype' },
        { kind: 'block', type: 'head' },
        { kind: 'block', type: 'body' },
        { kind: 'block', type: 'title' },
      ]
    },
    {
      kind: 'category',
      name: 'Structure',
      colour: '#7b68ee',
      contents: [
        { kind: 'label', text: 'HTML structure elements' },
        { kind: 'block', type: 'div' },
        { kind: 'block', type: 'header' },
        { kind: 'block', type: 'nav' },
        { kind: 'block', type: 'main' },
        { kind: 'block', type: 'footer' },
        { kind: 'block', type: 'section' },
        { kind: 'block', type: 'article' },
        { kind: 'block', type: 'br' },
        { kind: 'block', type: 'hr' },
      ]
    },
    {
      kind: 'category',
      name: 'Text',
      colour: '#4a90e2',
      contents: [
        { kind: 'block', type: 'heading' },
        { kind: 'block', type: 'paragraph' },
        { kind: 'block', type: 'span' },
        { kind: 'block', type: 'a_tag' },
        { kind: 'block', type: 'strong' },
        { kind: 'block', type: 'em' },
      ]
    },
    {
      kind: 'category',
      name: 'Attributes',
      colour: '#F5B945',
      contents: [
        { kind: 'block', type: 'class' },
        { kind: 'block', type: 'id' },
        { kind: 'block', type: 'body_style' },
        { kind: 'block', type: 'extra_attributes' },
      ]
    },
    {
      kind: 'category',
      name: 'Media',
      colour: '#D94452',
      contents: [
        { kind: 'block', type: 'img' },
        { kind: 'block', type: 'audio' },
        { kind: 'block', type: 'video' },
      ]
    },
    {
      kind: 'category',
      name: 'Forms',
      colour: '#20b2aa',
      contents: [
        { kind: 'block', type: 'form' },
        { kind: 'block', type: 'label' },
        { kind: 'block', type: 'input' },
        { kind: 'block', type: 'textarea' },
        { kind: 'block', type: 'button' },
      ]
    },
    {
      kind: 'category',
      name: 'Tables',
      colour: '#9b59b6',
      contents: [
        { kind: 'block', type: 'table' },
        { kind: 'block', type: 'th' },
        { kind: 'block', type: 'tr' },
        { kind: 'block', type: 'td' },
      ]
    },
    {
      kind: 'category',
      name: 'Lists',
      colour: '#ff6b6b',
      contents: [
        { kind: 'block', type: 'li' },
        { kind: 'block', type: 'ul' },
        { kind: 'block', type: 'ol' },
        { kind: 'block', type: 'select' },
        { kind: 'block', type: 'option' },
      ]
    },
    {
      kind: 'sep'
    },
    {
      kind: 'toolboxlabel',
      name: 'CSS',
      colour: '#000000',
      cssconfig: {
        label: 'customLabel'
      }
    },
    {
      kind: 'category',
      name: 'External',
      colour: '#34A853',
      cssconfig: {
        row: 'externalCSS'
      },
      contents: [
        {kind: 'block', type: 'head_style'},
        {kind: 'block', type: 'head_link'},
        {kind: 'block', type: 'style_target'},
        {kind: 'block', type: 'style_effect'},
        {
          kind: 'category',
          name: 'Text',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Text styling for style tag' },
            { kind: 'block', type: 'external_text_color' },
            { kind: 'block', type: 'external_font_family' },
            { kind: 'block', type: 'external_font_size' },
            { kind: 'block', type: 'external_font_size_descriptive' },
            { kind: 'block', type: 'external_text_align' },
            { kind: 'block', type: 'external_text_transform' },
            { kind: 'block', type: 'external_text_decoration' },
            { kind: 'block', type: 'external_text_shadow' },
          ]
        },
        {
          kind: 'category',
          name: 'Display',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Display styling for style tag' },
            { kind: 'block', type: 'external_display' },
            { kind: 'block', type: 'external_overflow' },
            { kind: 'block', type: 'external_float' },
            { kind: 'block', type: 'external_height' },
            { kind: 'block', type: 'external_width' },
          ]
        },
        {
          kind: 'category',
          name: 'Spacing',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Spacing styling for style tag' },
            { kind: 'block', type: 'external_margin' },
            { kind: 'block', type: 'external_margin_specific' },
            { kind: 'block', type: 'external_padding' },
            { kind: 'block', type: 'external_padding_specific' },
          ]
        },
        {
          kind: 'category',
          name: 'Background',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Background styling for style tag' },
            { kind: 'block', type: 'external_background_color' },
            { kind: 'block', type: 'external_background_image' },
            { kind: 'block', type: 'external_background_repeat' },
            { kind: 'block', type: 'external_background_position' },
            { kind: 'block', type: 'external_background_size' },
            { kind: 'block', type: 'external_background_clip' },
          ]
        },
        {
          kind: 'category',
          name: 'Border',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Border styling for style tag' },
            { kind: 'block', type: 'external_border' },
            { kind: 'block', type: 'external_border_specific' },
            { kind: 'block', type: 'external_border_radius' },
            { kind: 'block', type: 'external_border_radius_specific' },
          ]
        },
        {
          kind: 'category',
          name: 'Positioning',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Positioning properties' },
            { kind: 'block', type: 'external_position' },
            { kind: 'block', type: 'external_top' },
            { kind: 'block', type: 'external_right' },
            { kind: 'block', type: 'external_bottom' },
            { kind: 'block', type: 'external_left' },
            { kind: 'block', type: 'external_z_index' },
          ]
        },
        // NEW: Flexbox subcategory
        {
          kind: 'category',
          name: 'Flexbox',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Flexbox container & item properties' },
            { kind: 'block', type: 'external_flex_direction' },
            { kind: 'block', type: 'external_flex_wrap' },
            { kind: 'block', type: 'external_justify_content' },
            { kind: 'block', type: 'external_align_items' },
            { kind: 'block', type: 'external_align_content' },
            { kind: 'block', type: 'external_order' },
            { kind: 'block', type: 'external_flex_grow' },
            { kind: 'block', type: 'external_flex_shrink' },
            { kind: 'block', type: 'external_flex_basis' },
            { kind: 'block', type: 'external_align_self' },
          ]
        },
        // NEW: Grid subcategory
        {
          kind: 'category',
          name: 'Grid',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Grid container & item properties' },
            { kind: 'block', type: 'external_grid_template_columns' },
            { kind: 'block', type: 'external_grid_template_rows' },
            { kind: 'block', type: 'external_gap' },
            { kind: 'block', type: 'external_grid_column' },
            { kind: 'block', type: 'external_grid_row' },
          ]
        },
        // NEW: Box Model (additional)
        {
          kind: 'category',
          name: 'Box Model',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Box sizing, outline, opacity' },
            { kind: 'block', type: 'external_box_sizing' },
            { kind: 'block', type: 'external_outline' },
            { kind: 'block', type: 'external_opacity' },
          ]
        },
        // NEW: Transitions & Transforms
        {
          kind: 'category',
          name: 'Transitions',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Transition and transform properties' },
            { kind: 'block', type: 'external_transition_property' },
            { kind: 'block', type: 'external_transition_duration' },
            { kind: 'block', type: 'external_transition_timing' },
            { kind: 'block', type: 'external_transition_delay' },
            { kind: 'block', type: 'external_transform' },
          ]
        },
        // NEW: Text & Misc (additional)
        {
          kind: 'category',
          name: 'Text & Misc',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'White space, word break, etc.' },
            { kind: 'block', type: 'external_white_space' },
            { kind: 'block', type: 'external_word_break' },
            { kind: 'block', type: 'external_overflow_wrap' },
          ]
        },
        {
          kind: 'category',
          name: 'Other',
          colour: '#34A853',
          contents: [
            { kind: 'label', text: 'Other stylings for style tag' },
            { kind: 'block', type: 'external_cursor' },
            { kind: 'block', type: 'external_box_shadow' },
          ]
        },
      ]
    },
    {
      kind: 'category',
      name: 'Internal',
      colour: '#ff6b6b',
      cssconfig: {
        row: 'internalCSS'
      },
      contents: [
        {
          kind: 'category',
          name: 'Text',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Text styling for style tag' },
            { kind: 'block', type: 'internal_text_color' },
            { kind: 'block', type: 'internal_font_family' },
            { kind: 'block', type: 'internal_font_size' },
            { kind: 'block', type: 'internal_font_size_descriptive' },
            { kind: 'block', type: 'internal_text_align' },
            { kind: 'block', type: 'internal_text_transform' },
            { kind: 'block', type: 'internal_text_decoration' },
            { kind: 'block', type: 'internal_text_shadow' },
          ]
        },
        {
          kind: 'category',
          name: 'Display',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Display styling for style tag' },
            { kind: 'block', type: 'internal_display' },
            { kind: 'block', type: 'internal_overflow' },
            { kind: 'block', type: 'internal_float' },
            { kind: 'block', type: 'internal_height' },
            { kind: 'block', type: 'internal_width' },
          ]
        },
        {
          kind: 'category',
          name: 'Spacing',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Spacing styling for style tag' },
            { kind: 'block', type: 'internal_margin' },
            { kind: 'block', type: 'internal_margin_specific' },
            { kind: 'block', type: 'internal_padding' },
            { kind: 'block', type: 'internal_padding_specific' },
          ]
        },
        {
          kind: 'category',
          name: 'Background',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Background styling for style tag' },
            { kind: 'block', type: 'internal_background_color' },
            { kind: 'block', type: 'internal_background_image' },
            { kind: 'block', type: 'internal_background_repeat' },
            { kind: 'block', type: 'internal_background_position' },
            { kind: 'block', type: 'internal_background_size' },
            { kind: 'block', type: 'internal_background_clip' },
          ]
        },
        {
          kind: 'category',
          name: 'Border',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Border styling for style tag' },
            { kind: 'block', type: 'internal_border' },
            { kind: 'block', type: 'internal_border_specific' },
            { kind: 'block', type: 'internal_border_radius' },
            { kind: 'block', type: 'internal_border_radius_specific' },
          ]
        },
        {
          kind: 'category',
          name: 'Positioning',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Positioning properties' },
            { kind: 'block', type: 'internal_position' },
            { kind: 'block', type: 'internal_top' },
            { kind: 'block', type: 'internal_right' },
            { kind: 'block', type: 'internal_bottom' },
            { kind: 'block', type: 'internal_left' },
            { kind: 'block', type: 'internal_z_index' },
          ]
        },
        {
          kind: 'category',
          name: 'Flexbox',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Flexbox properties' },
            { kind: 'block', type: 'internal_flex_direction' },
            { kind: 'block', type: 'internal_flex_wrap' },
            { kind: 'block', type: 'internal_justify_content' },
            { kind: 'block', type: 'internal_align_items' },
            { kind: 'block', type: 'internal_align_content' },
            { kind: 'block', type: 'internal_order' },
            { kind: 'block', type: 'internal_flex_grow' },
            { kind: 'block', type: 'internal_flex_shrink' },
            { kind: 'block', type: 'internal_flex_basis' },
            { kind: 'block', type: 'internal_align_self' },
          ]
        },
        {
          kind: 'category',
          name: 'Grid',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Grid properties' },
            { kind: 'block', type: 'internal_grid_template_columns' },
            { kind: 'block', type: 'internal_grid_template_rows' },
            { kind: 'block', type: 'internal_gap' },
            { kind: 'block', type: 'internal_grid_column' },
            { kind: 'block', type: 'internal_grid_row' },
          ]
        },
        {
          kind: 'category',
          name: 'Box Model',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Box sizing, outline, opacity' },
            { kind: 'block', type: 'internal_box_sizing' },
            { kind: 'block', type: 'internal_outline' },
            { kind: 'block', type: 'internal_opacity' },
          ]
        },
        {
          kind: 'category',
          name: 'Transitions',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Transition & transform' },
            { kind: 'block', type: 'internal_transition_property' },
            { kind: 'block', type: 'internal_transition_duration' },
            { kind: 'block', type: 'internal_transition_timing' },
            { kind: 'block', type: 'internal_transition_delay' },
            { kind: 'block', type: 'internal_transform' },
          ]
        },
        {
          kind: 'category',
          name: 'Text & Misc',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'White space, word break, etc.' },
            { kind: 'block', type: 'internal_white_space' },
            { kind: 'block', type: 'internal_word_break' },
            { kind: 'block', type: 'internal_overflow_wrap' },
          ]
        },
        {
          kind: 'category',
          name: 'Other',
          colour: '#4285F4',
          contents: [
            { kind: 'label', text: 'Other stylings for style tag' },
            { kind: 'block', type: 'internal_cursor' },
            { kind: 'block', type: 'internal_box_shadow' },
          ]
        },
      ]
    },
    {
      kind: 'sep'
    },
    {
      kind: 'toolboxlabel',
      name: 'JavaScript',
      colour: '#000000',
      cssconfig: {
        label: 'customLabel'
      }
    },
    {
      kind: 'sep'
    },
    {
      kind: 'category',
      name: 'File Links',
      colour: 160,
      contents: [
        {
          kind: 'block',
          type: 'link_css_file'
        },
        {
          kind: 'block',
          type: 'script_js_file'
        },
        {
          kind: 'block',
          type: 'link_to_page'
        }
      ]
    }
  ]
};

// export const toolboxConfig = {
//   kind: 'categoryToolbox',
//   contents: [
//     // ========== HTML SECTION ==========
//     {
//       kind: 'sep'
//     },
//     {
//       kind: 'category',
//       name: 'HTML',
//       colour: '#f16529',
//       cssconfig: {
//         row: 'htmlCategory'
//       },
//       contents:[
//         {
//           kind: 'toolboxlabel',
//           name: 'HTML',
//           colour: '#000000',
//           cssconfig: {
//             label: 'customLabel'
//           }
//         },
//         {
//           kind: 'category',
//           name: 'Document',
//           colour: '#5C81A6',
//           contents: [
//             { kind: 'block', type: 'html_boilerplate' },
//             { kind: 'block', type: 'html_head' },
//             { kind: 'block', type: 'html_body' },
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Head Elements',
//           colour: '#8B5CF6',
//           contents: [
//             { kind: 'block', type: 'html_title' },
//             { kind: 'block', type: 'html_meta' },
//             { kind: 'block', type: 'html_link' },
//             { kind: 'block', type: 'html_style' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Layout',
//           colour: '#10B981',
//           contents: [
//             { kind: 'block', type: 'html_div' },
//             { kind: 'block', type: 'html_section' },
//             { kind: 'block', type: 'html_header' },
//             { kind: 'block', type: 'html_footer' },
//             { kind: 'block', type: 'html_nav' },
//             { kind: 'block', type: 'html_main' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Text',
//           colour: '#F59E0B',
//           contents: [
//             { kind: 'block', type: 'html_heading' },
//             { kind: 'block', type: 'html_paragraph' },
//             { kind: 'block', type: 'html_text' },
//             { kind: 'block', type: 'html_span' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Media',
//           colour: '#EC4899',
//           contents: [
//             { kind: 'block', type: 'html_image' },
//             { kind: 'block', type: 'html_video' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Interactive',
//           colour: '#3B82F6',
//           contents: [
//             { kind: 'block', type: 'html_link_element' },
//             { kind: 'block', type: 'html_button' },
//             { kind: 'block', type: 'html_input' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Lists',
//           colour: '#6366F1',
//           contents: [
//             { kind: 'block', type: 'html_list' },
//             { kind: 'block', type: 'html_list_item' }
//           ]
//         },
//       ]
//     },
//     // ========== CSS SECTION ==========
//     {
//       kind: 'sep'
//     },
//     {
//       kind: 'category',
//       name: 'CSS',
//       colour: '#29a8e0',
//       cssconfig: {
//         row: 'cssCategory'
//       },
//       contents: [
//         {
//           kind: 'toolboxlabel',
//           name: 'CSS',
//           colour: '#000000',
//           cssconfig: {
//             label: 'customLabel',
//           }
//         },
//         {
//           kind: 'category',
//           name: 'CSS Rules',
//           colour: '#E11D48',
//           contents: [
//             { kind: 'block', type: 'css_rule' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Typography',
//           colour: '#FB7185',
//           contents: [
//             { kind: 'block', type: 'css_color' },
//             { kind: 'block', type: 'css_background' },
//             { kind: 'block', type: 'css_font_size' },
//             { kind: 'block', type: 'css_font_family' },
//             { kind: 'block', type: 'css_text_align' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Box Model',
//           colour: '#A855F7',
//           contents: [
//             { kind: 'block', type: 'css_margin' },
//             { kind: 'block', type: 'css_padding' },
//             { kind: 'block', type: 'css_border' },
//             { kind: 'block', type: 'css_border_radius' },
//             { kind: 'block', type: 'css_width' },
//             { kind: 'block', type: 'css_height' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Layout',
//           colour: '#14B8A6',
//           contents: [
//             { kind: 'block', type: 'css_display' },
//             { kind: 'block', type: 'css_flexbox' },
//             { kind: 'block', type: 'css_position' }
//           ]
//         },
//         {
//           kind: 'category',
//           name: 'Custom',
//           colour: '#64748B',
//           contents: [
//             { kind: 'block', type: 'css_custom' }
//           ]
//         },
//       ]
//     },
//     {
//       kind: 'sep'
//     }
//   ]
// };