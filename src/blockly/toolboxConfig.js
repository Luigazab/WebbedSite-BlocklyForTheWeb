
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
        { kind: 'block', type: 'html_meta_charset' },
        { kind: 'block', type: 'html_meta_viewport' },
        { kind: 'block', type: 'html_meta_named' },
        { kind: 'block', type: 'html_meta_http_equiv' },
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
        { kind: 'block', type: 'html_aside' },
        { kind: 'block', type: 'html_address' },
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
        { kind: 'block', type: 'html_b' },
        { kind: 'block', type: 'html_i' },
        { kind: 'block', type: 'html_mark' },
        { kind: 'block', type: 'html_small' },
        { kind: 'block', type: 'html_del' },
        { kind: 'block', type: 'html_ins' },
        { kind: 'block', type: 'html_sub' },
        { kind: 'block', type: 'html_sup' },
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
        { kind: 'block', type: 'html_iframe' },
        { kind: 'block', type: 'html_embed' },
        { kind: 'block', type: 'html_object' },
        { kind: 'block', type: 'html_picture' },
        { kind: 'block', type: 'html_source' },
        { kind: 'block', type: 'html_track' },
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
        { kind: 'block', type: 'html_fieldset' },
        { kind: 'block', type: 'html_legend' },
        { kind: 'block', type: 'html_datalist' },
        { kind: 'block', type: 'html_optgroup' },
        { kind: 'block', type: 'html_progress' },
        { kind: 'block', type: 'html_meter' },
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
        { kind: 'block', type: 'html_caption' },
        { kind: 'block', type: 'html_colgroup' },
        { kind: 'block', type: 'html_col' },
        { kind: 'block', type: 'html_thead' },
        { kind: 'block', type: 'html_tbody' },
        { kind: 'block', type: 'html_tfoot' },
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
        { kind: 'block', type: 'html_dl' },
        { kind: 'block', type: 'html_dt' },
        { kind: 'block', type: 'html_dd' },
      ]
    },
    {
      kind: 'category',
      name: 'Interactive',
      colour: '#E67E22',
      contents: [
        { kind: 'block', type: 'html_details' },
        { kind: 'block', type: 'html_summary' },
        { kind: 'block', type: 'html_dialog' },
        { kind: 'block', type: 'html_script_inline' },
      ],
    },
    {
      kind: 'category',
      name: 'Graphics',
      colour: '#27AE60',
      contents: [
        { kind: 'block', type: 'html_svg' },
        { kind: 'block', type: 'html_canvas' },
      ],
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
        { kind: 'block', type: 'css_pseudo_class' },
        { kind: 'block', type: 'css_nth_child' },
        { kind: 'block', type: 'css_pseudo_element' },
        { kind: 'block', type: 'css_not_pseudo' },
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
            { kind: 'block', type: 'external_font_weight' },
            { kind: 'block', type: 'external_font_style' },
            { kind: 'block', type: 'external_font_variant' },
            { kind: 'block', type: 'external_line_height' },
            { kind: 'block', type: 'external_letter_spacing' },
            { kind: 'block', type: 'external_word_spacing' },
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
        {
          kind: 'category',
          name: 'Lists',
          colour: '#34A853',
          contents: [
            { kind: 'block', type: 'external_list_style_type' },
            { kind: 'block', type: 'external_list_style_position' },
            { kind: 'block', type: 'external_list_style_image' },
          ],
        },
        {
          kind: 'category',
          name: 'Tables',
          colour: '#34A853',
          contents: [
            { kind: 'block', type: 'external_border_collapse' },
            { kind: 'block', type: 'external_border_spacing' },
            { kind: 'block', type: 'external_caption_side' },
            { kind: 'block', type: 'external_empty_cells' },
            { kind: 'block', type: 'external_table_layout' },
          ],
        },
        {
          kind: 'category',
          name: 'Columns',
          colour: '#34A853',
          contents: [
            { kind: 'block', type: 'external_column_count' },
            { kind: 'block', type: 'external_column_gap' },
            { kind: 'block', type: 'external_column_rule' },
            { kind: 'block', type: 'external_column_width' },
            { kind: 'block', type: 'external_column_span' },
          ],
        },
        {
          kind: 'category',
          name: 'Animation',
          colour: '#34A853',
          contents: [
            { kind: 'block', type: 'css_keyframes' },
            { kind: 'block', type: 'external_animation_name' },
            { kind: 'block', type: 'external_animation_duration' },
            { kind: 'block', type: 'external_animation_timing' },
            { kind: 'block', type: 'external_animation_delay' },
            { kind: 'block', type: 'external_animation_iteration' },
            { kind: 'block', type: 'external_animation_direction' },
            { kind: 'block', type: 'external_animation_fill_mode' },
            { kind: 'block', type: 'external_animation_play_state' },
          ],
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
            { kind: 'block', type: 'external_transform_scale' },
            { kind: 'block', type: 'external_transform_translate' },
            { kind: 'block', type: 'external_transform_rotate' },
            { kind: 'block', type: 'external_transform_skew' },
            { kind: 'block', type: 'external_filter' },
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
            { kind: 'block', type: 'internal_font_weight' },
            { kind: 'block', type: 'internal_font_style' },
            { kind: 'block', type: 'internal_font_variant' },
            { kind: 'block', type: 'internal_line_height' },
            { kind: 'block', type: 'internal_letter_spacing' },
            { kind: 'block', type: 'internal_word_spacing' },
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
          name: 'Lists',
          colour: '#34A853',
          contents: [
            { kind: 'block', type: 'internal_list_style_type' },
            { kind: 'block', type: 'internal_list_style_position' },
            { kind: 'block', type: 'internal_list_style_image' },
          ],
        },
      
        {
          kind: 'category',
          name: 'Tables',
          colour: '#34A853',
          contents: [
            { kind: 'block', type: 'internal_border_collapse' },
            { kind: 'block', type: 'internal_border_spacing' },
            { kind: 'block', type: 'internal_caption_side' },
            { kind: 'block', type: 'internal_empty_cells' },
            { kind: 'block', type: 'internal_table_layout' },
          ],
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
            { kind: 'block', type: 'internal_transform_scale' },
            { kind: 'block', type: 'internal_transform_translate' },
            { kind: 'block', type: 'internal_transform_rotate' },
            { kind: 'block', type: 'internal_transform_skew' },
            { kind: 'block', type: 'internal_filter' },
          ]
        },
      ]
    },
    { kind: 'sep' },
    {
      kind: 'toolboxlabel',
      name: 'JavaScript',
      colour: '#000000',
      cssconfig: { label: 'customLabel' },
    },
    { kind: 'sep' },
 
    // ── Script wrappers ──────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Script',
      colour: '#F7DF1E',
      contents: [
        { kind: 'block', type: 'js_script_body' },
        { kind: 'block', type: 'js_script_head' },
        { kind: 'block', type: 'js_dom_content_loaded' },
      ],
    },
 
    // ── Variables & Constants ────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Variables',
      colour: '#E6A817',
      contents: [
        { kind: 'block', type: 'variables_set' },
        { kind: 'block', type: 'variables_get' },
        { kind: 'label', text: 'Declare' },
        { kind: 'block', type: 'js_let' },
        { kind: 'block', type: 'js_const' },
        { kind: 'block', type: 'js_var_decl' },
        { kind: 'block', type: 'js_global_var' },
        { kind: 'label', text: 'Assign' },
        { kind: 'block', type: 'js_get_var' },
        { kind: 'block', type: 'js_set_var' },
        { kind: 'block', type: 'js_compound_assign' },
        { kind: 'block', type: 'js_increment' },
      ],
    },
 
    // ── Data Types ───────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Data Types',
      colour: '#E8760A',
      contents: [
        { kind: 'block', type: 'js_string_val' },
        { kind: 'block', type: 'js_number_val' },
        { kind: 'block', type: 'js_boolean_val' },
        { kind: 'block', type: 'js_null' },
        { kind: 'block', type: 'js_undefined' },
        { kind: 'block', type: 'js_template_literal' },
        { kind: 'label', text: 'Arrays' },
        { kind: 'block', type: 'js_empty_array' },
        { kind: 'block', type: 'js_array_create' },
        { kind: 'label', text: 'Objects' },
        { kind: 'block', type: 'js_object_literal' },
        { kind: 'block', type: 'js_property_get' },
        { kind: 'block', type: 'js_property_set' },
        { kind: 'block', type: 'js_bracket_get' },
        { kind: 'block', type: 'js_bracket_set' },
        { kind: 'block', type: 'js_new_instance' },
      ],
    },
 
    // ── Operators ────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Operators',
      colour: '#4285F4',
      contents: [
        { kind: 'block', type: 'js_arithmetic' },
        { kind: 'block', type: 'js_compare' },
        { kind: 'block', type: 'js_logic_op' },
        { kind: 'block', type: 'js_not' },
        { kind: 'block', type: 'js_ternary' },
        { kind: 'block', type: 'js_typeof' },
        { kind: 'block', type: 'js_instanceof' },
        { kind: 'block', type: 'js_spread' },
      ],
    },
 
    // ── Control Flow ─────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Control Flow',
      colour: '#C0392B',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'label', text: 'Custom if / else' },
        { kind: 'block', type: 'js_if' },
        { kind: 'block', type: 'js_if_else' },
        { kind: 'block', type: 'js_if_else_if' },
        { kind: 'label', text: 'Loops' },
        { kind: 'block', type: 'js_while' },
        { kind: 'block', type: 'js_do_while' },
        { kind: 'block', type: 'js_for_count' },
        { kind: 'block', type: 'js_for_range' },
        { kind: 'block', type: 'js_for_of' },
        { kind: 'block', type: 'js_for_in' },
        { kind: 'block', type: 'js_break' },
        { kind: 'block', type: 'js_continue' },
        { kind: 'label', text: 'Advanced' },
        { kind: 'block', type: 'js_switch' },
        { kind: 'block', type: 'js_try_catch' },
        { kind: 'block', type: 'js_try_catch_finally' },
        { kind: 'block', type: 'js_throw' },
      ],
    },
 
    // ── Functions ────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Functions',
      colour: '#8E44AD',
      contents: [
        { kind: 'block', type: 'procedures_defnoreturn' },
        { kind: 'block', type: 'procedures_defreturn' },
        { kind: 'block', type: 'procedures_callnoreturn' },
        { kind: 'block', type: 'procedures_callreturn' },
        { kind: 'label', text: 'Custom functions' },
        { kind: 'block', type: 'js_function_def' },
        { kind: 'block', type: 'js_function_call_stmt' },
        { kind: 'block', type: 'js_function_call_expr' },
        { kind: 'block', type: 'js_arrow_function' },
        { kind: 'block', type: 'js_async_function' },
        { kind: 'block', type: 'js_return' },
        { kind: 'block', type: 'js_return_void' },
        { kind: 'block', type: 'js_await' },
      ],
    },
 
    // ── Console & Dialog ─────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Console',
      colour: '#27AE60',
      contents: [
        { kind: 'block', type: 'js_console_log' },
        { kind: 'block', type: 'js_console_error' },
        { kind: 'block', type: 'js_console_warn' },
        { kind: 'block', type: 'js_alert' },
        { kind: 'block', type: 'js_confirm' },
        { kind: 'block', type: 'js_prompt' },
      ],
    },
 
    // ── Math ─────────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Math',
      colour: '#2980B9',
      contents: [
        { kind: 'block', type: 'js_arithmetic' },
        { kind: 'block', type: 'js_math_random' },
        { kind: 'block', type: 'js_math_random_int' },
        { kind: 'block', type: 'js_math_method' },
        { kind: 'block', type: 'js_math_pow' },
        { kind: 'block', type: 'js_math_min_max' },
        { kind: 'block', type: 'js_parse_number' },
        { kind: 'block', type: 'js_to_string' },
        { kind: 'block', type: 'js_date_now' },
        { kind: 'block', type: 'js_new_date' },
      ],
    },
 
    // ── Strings ──────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Strings',
      colour: '#E67E22',
      contents: [
        { kind: 'block', type: 'js_string_concat' },
        { kind: 'block', type: 'js_template_literal' },
        { kind: 'block', type: 'js_string_length' },
        { kind: 'block', type: 'js_string_case' },
        { kind: 'block', type: 'js_string_includes' },
        { kind: 'block', type: 'js_string_starts_ends' },
        { kind: 'block', type: 'js_string_index_of' },
        { kind: 'block', type: 'js_string_slice' },
        { kind: 'block', type: 'js_string_replace' },
        { kind: 'block', type: 'js_string_split' },
        { kind: 'block', type: 'js_string_repeat' },
        { kind: 'block', type: 'js_string_char_at' },
      ],
    },
 
    // ── Arrays ───────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Arrays',
      colour: '#9B59B6',
      contents: [
        { kind: 'block', type: 'js_empty_array' },
        { kind: 'block', type: 'js_array_create' },
        { kind: 'block', type: 'js_array_length' },
        { kind: 'block', type: 'js_array_get' },
        { kind: 'block', type: 'js_array_set' },
        { kind: 'label', text: 'Add / Remove' },
        { kind: 'block', type: 'js_array_push' },
        { kind: 'block', type: 'js_array_pop' },
        { kind: 'block', type: 'js_array_shift' },
        { kind: 'block', type: 'js_array_unshift' },
        { kind: 'label', text: 'Search' },
        { kind: 'block', type: 'js_array_includes' },
        { kind: 'block', type: 'js_array_index_of' },
        { kind: 'label', text: 'Transform' },
        { kind: 'block', type: 'js_array_join' },
        { kind: 'block', type: 'js_array_mutate' },
        { kind: 'block', type: 'js_array_slice' },
        { kind: 'block', type: 'js_array_splice' },
        { kind: 'block', type: 'js_array_concat' },
      ],
    },
 
    // ── DOM Manipulation ─────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'DOM',
      colour: '#2471A3',
      contents: [
        { kind: 'label', text: 'Select Elements' },
        { kind: 'block', type: 'js_get_by_id' },
        { kind: 'block', type: 'js_query_selector' },
        { kind: 'block', type: 'js_query_selector_all' },
        { kind: 'block', type: 'js_document_body' },
        { kind: 'label', text: 'Create / Remove' },
        { kind: 'block', type: 'js_create_element' },
        { kind: 'block', type: 'js_append_child' },
        { kind: 'block', type: 'js_remove_element' },
        { kind: 'label', text: 'Content' },
        { kind: 'block', type: 'js_set_inner_html' },
        { kind: 'block', type: 'js_get_inner_html' },
        { kind: 'block', type: 'js_set_text_content' },
        { kind: 'block', type: 'js_get_text_content' },
        { kind: 'block', type: 'js_set_value' },
        { kind: 'block', type: 'js_get_value' },
        { kind: 'label', text: 'Attributes & Style' },
        { kind: 'block', type: 'js_set_attribute' },
        { kind: 'block', type: 'js_get_attribute' },
        { kind: 'block', type: 'js_class_list' },
        { kind: 'block', type: 'js_class_list_contains' },
        { kind: 'block', type: 'js_set_style' },
        { kind: 'block', type: 'js_get_style' },
        { kind: 'block', type: 'js_document_title' },
      ],
    },
 
    // ── Events ───────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Events',
      colour: '#E74C3C',
      contents: [
        { kind: 'block', type: 'js_add_event_listener' },
        { kind: 'block', type: 'js_window_event' },
        { kind: 'block', type: 'js_dom_content_loaded' },
        { kind: 'label', text: 'Event Info' },
        { kind: 'block', type: 'js_event_target' },
        { kind: 'block', type: 'js_event_value' },
        { kind: 'block', type: 'js_event_key' },
        { kind: 'block', type: 'js_prevent_default' },
        { kind: 'block', type: 'js_stop_propagation' },
      ],
    },
 
    // ── Timers ───────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Timers',
      colour: '#1ABC9C',
      contents: [
        { kind: 'block', type: 'js_set_timeout' },
        { kind: 'block', type: 'js_set_interval' },
        { kind: 'block', type: 'js_set_timeout_var' },
        { kind: 'block', type: 'js_set_interval_var' },
        { kind: 'block', type: 'js_clear_timeout' },
        { kind: 'block', type: 'js_clear_interval' },
      ],
    },
 
    // ── Fetch & JSON ─────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Fetch & JSON',
      colour: '#7F8C8D',
      contents: [
        { kind: 'block', type: 'js_fetch_get' },
        { kind: 'block', type: 'js_fetch_post' },
        { kind: 'block', type: 'js_json_parse' },
        { kind: 'block', type: 'js_json_stringify' },
      ],
    },
 
    // ── Storage ──────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Storage',
      colour: '#28B463',
      contents: [
        { kind: 'label', text: 'localStorage' },
        { kind: 'block', type: 'js_local_storage_set' },
        { kind: 'block', type: 'js_local_storage_get' },
        { kind: 'block', type: 'js_local_storage_remove' },
        { kind: 'block', type: 'js_local_storage_clear' },
        { kind: 'label', text: 'sessionStorage' },
        { kind: 'block', type: 'js_session_storage_set' },
        { kind: 'block', type: 'js_session_storage_get' },
      ],
    },
 
    // ── Misc ─────────────────────────────────────────────────────────────
    {
      kind: 'category',
      name: 'Misc',
      colour: '#95A5A6',
      contents: [
        { kind: 'block', type: 'js_comment' },
        { kind: 'block', type: 'js_block_comment' },
        { kind: 'block', type: 'js_use_strict' },
        { kind: 'block', type: 'js_debugger' },
        { kind: 'block', type: 'js_window_location' },
        { kind: 'block', type: 'js_window_location_get' },
      ],
    },
 
    // ══════════════════════════════════════════════════════════════════════
    // FILE LINKS (multi-file project)
    // ══════════════════════════════════════════════════════════════════════
    { kind: 'sep' },
    {
      kind: 'category',
      name: 'File Links',
      colour: 160,
      contents: [
        { kind: 'block', type: 'link_css_file' },
        { kind: 'block', type: 'script_js_file' },
        { kind: 'block', type: 'link_to_page' },
      ],
    },
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