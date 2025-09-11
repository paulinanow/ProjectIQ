# ProjectIQ - Task Manager

A modern, responsive task management web application built with vanilla JavaScript, Tailwind CSS, and Lucide icons. Features a clean, professional design with dark mode support and intuitive user experience.

[View ProjectIQ](https://black-desert-073debf03.2.azurestaticapps.net)

## ✨ Features

### Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks
- **Dual Views**: 
  - **Backlog**: Table view with all tasks and actions
  - **Kanban Board**: Drag-and-drop interface with status columns
- **Task Properties**: Title, description, priority (low/medium/high), due date, status
- **Search & Filter**: Real-time search across task titles and descriptions
- **Dark Mode**: Toggle between light and dark themes

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Drag & Drop**: Intuitive task status updates on the Kanban board
- **Local Storage**: Data persists between browser sessions
- **Modern UI**: Clean, professional interface with smooth animations
- **Accessibility**: Keyboard navigation and screen reader friendly

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No Node.js or build tools required!

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start managing your tasks!

### Alternative: Local Server
For the best experience, serve the files using a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 📁 Project Structure

```
ProjectIQ/
├── index.html          # Main HTML file with layout and structure
├── styles.css          # Custom CSS styles and dark mode support
├── app.js             # Main JavaScript application logic
└── README.md          # Project documentation
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) for buttons and active states
- **Success**: Green (#10B981) for completed tasks
- **Warning**: Yellow (#F59E0B) for medium priority
- **Error**: Red (#EF4444) for high priority and delete actions
- **Neutral**: Gray scale for backgrounds and text

### Typography
- **Font**: System fonts (San Francisco, Segoe UI, etc.)
- **Sizes**: Responsive text sizing with Tailwind's scale
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Consistent styling with hover states
- **Badges**: Color-coded priority and status indicators
- **Modal**: Centered overlay with backdrop blur

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Custom styles with Tailwind CSS utility classes
- **JavaScript (ES6+)**: Modern JavaScript with classes and modules
- **Tailwind CSS**: Utility-first CSS framework via CDN
- **Lucide Icons**: Beautiful, customizable icons
- **Local Storage**: Client-side data persistence

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- **Lightweight**: No heavy frameworks or build processes
- **Fast Loading**: CDN resources with fallbacks
- **Efficient**: Minimal JavaScript with optimized rendering
- **Responsive**: Mobile-first design approach

## 🎯 Usage Guide

### Creating Tasks
1. Click the "Add Task" button in the header
2. Fill in the task details (title, description, priority, due date)
3. Click "Save Task" to create the task

### Managing Tasks
- **Edit**: Click the edit icon (pencil) on any task
- **Delete**: Click the delete icon (trash) and confirm
- **Search**: Use the search bar to filter tasks
- **Status Change**: Drag tasks between columns on the Kanban board

### Navigation
- **Backlog**: View all tasks in a table format
- **Board**: Kanban-style board with drag-and-drop
- **Dark Mode**: Toggle theme using the button in the sidebar

## 🔮 Future Enhancements

### Planned Features
- [ ] Task categories and labels
- [ ] Due date reminders and notifications
- [ ] Task templates and bulk operations
- [ ] Export/import functionality
- [ ] Team collaboration features
- [ ] Advanced filtering and sorting
- [ ] Task dependencies and subtasks
- [ ] Time tracking and reporting

### Technical Improvements
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Data synchronization
- [ ] Performance optimizations
- [ ] Enhanced accessibility features

## 🤝 Contributing

This is a learning project, but contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and structure
- Add comments for complex logic
- Test on multiple browsers and devices
- Ensure accessibility compliance
- Keep the code clean and maintainable

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **Vibe Coding** principles for clean, structured code
- The open source community for inspiration and tools

---

**Built with ❤️ for modern web development**
