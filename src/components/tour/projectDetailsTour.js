// src/components/tour/projectDetailsTour.js
export const PROJECT_DETAILS_TOUR_ID = 'project-details'

export const projectDetailsTourSteps = [
  {
    target: '[data-tour="details-modal"]',
    title: 'Project Details',
    content:
      "This is your project's detail view! You can preview it, explore the blocks that built it, leave comments, and manage its settings — all from right here.",
  },
  {
    target: '[data-tour="details-title"]',
    title: 'Project Info',
    content:
      "Your project's title and description are shown here. These help others (and future-you!) know what the project is about at a glance.",
  },
  {
    target: '[data-tour="details-view-tabs"]',
    title: 'View Modes',
    content:
      "Switch between two views using these buttons. The monitor icon shows the live rendered website, and the code icon shows the actual Blockly block structure used to build it.",
  },
  {
    target: '[data-tour="details-file-tabs"]',
    title: 'File Tabs',
    content:
      "If your project has multiple files (HTML, CSS, JS), switch between them here. In Preview mode, CSS and JS files will always show the HTML output since they support the page — but in Blocks mode, each file shows its own unique block structure.",
  },
  {
    target: '[data-tour="details-preview-area"]',
    title: 'Preview & Blocks Area',
    content:
      "This is the main display. In Preview mode you see your live website rendered inside a frame. In Blocks mode you can explore the read-only Blockly canvas — zoom, pan, and see exactly how the project was built!",
  },
  {
    target: '[data-tour="details-like-btn"]',
    title: 'Like a Project',
    content:
      "Show some love! Click the thumbs-up to like this project. The count updates instantly and others can see how popular it is.",
  },
  {
    target: '[data-tour="details-visibility"]',
    title: 'Public vs Private',
    content:
      "Control who can see your project. Set it to Public and it appears in the community gallery for other students to discover, like, and comment on. Private keeps it just for you.",
  },
  {
    target: '[data-tour="details-comments"]',
    title: 'Comments',
    content:
      "Read what others have to say, or leave your own feedback! You can delete your own comments by hovering over them. Great for getting feedback from classmates or your teacher.",
  },
  {
    target: '[data-tour="details-delete-btn"]',
    title: 'Delete Project',
    content:
      "Need to start fresh? This permanently deletes the project. Be careful — there's no undo! Make sure to export it first if you want to keep a copy.",
  },
]