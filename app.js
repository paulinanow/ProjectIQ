// ProjectIQ Task Manager - Main Application
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentPage = 'backlog';
        this.editingTask = null;
        this.searchTerm = '';
        
        this.init();
    }

    init() {
        this.initializeIcons();
        this.setupEventListeners();
        this.setupDarkMode();
        this.navigateToPage(this.currentPage);
        this.renderTasks();
    }

    initializeIcons() {
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.renderTasks();
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Task modal
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Close modal on outside click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });
    }

    setupDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.documentElement.classList.add('dark');
            this.updateDarkModeButton();
        }
    }

    toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        this.updateDarkModeButton();
    }

    updateDarkModeButton() {
        const button = document.getElementById('darkModeToggle');
        const icon = button.querySelector('i');
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            icon.setAttribute('data-lucide', 'sun');
            button.innerHTML = '<i data-lucide="sun" class="w-5 h-5 mr-3"></i>Light Mode';
        } else {
            icon.setAttribute('data-lucide', 'moon');
            button.innerHTML = '<i data-lucide="moon" class="w-5 h-5 mr-3"></i>Dark Mode';
        }
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    navigateToPage(page) {
        this.currentPage = page;
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        
        // Update page title
        const titles = {
            backlog: 'Backlog',
            board: 'Kanban Board'
        };
        document.getElementById('pageTitle').textContent = titles[page];
        
        this.renderTasks();
    }

    renderTasks() {
        const content = document.getElementById('pageContent');
        
        if (this.currentPage === 'backlog') {
            content.innerHTML = this.renderBacklogView();
        } else if (this.currentPage === 'board') {
            content.innerHTML = this.renderBoardView();
        }
        
        this.setupTaskEventListeners();
    }

    renderBacklogView() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            return `
                <div class="text-center py-12">
                    <i data-lucide="inbox" class="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
                    <p class="text-gray-500 dark:text-gray-400">${this.searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first task.'}</p>
                </div>
            `;
        }

        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            ${filteredTasks.map(task => this.renderTaskRow(task)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderBoardView() {
        const columns = [
            { id: 'todo', title: 'To Do', status: 'todo' },
            { id: 'in-progress', title: 'In Progress', status: 'in-progress' },
            { id: 'done', title: 'Done', status: 'done' }
        ];

        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                ${columns.map(column => {
                    const columnTasks = this.getFilteredTasks().filter(task => task.status === column.status);
                    return `
                        <div class="kanban-column">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-medium text-gray-900 dark:text-white">${column.title}</h3>
                                <span class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-2.5 py-0.5 rounded-full">${columnTasks.length}</span>
                            </div>
                            <div class="space-y-3" data-status="${column.status}">
                                ${columnTasks.map(task => this.renderTaskCard(task)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderTaskRow(task) {
        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">${task.title}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${task.description || 'No description'}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${task.status}">${task.status.replace('-', ' ')}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3" onclick="taskManager.editTask('${task.id}')">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onclick="taskManager.deleteTask('${task.id}')">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    renderTaskCard(task) {
        return `
            <div class="task-card cursor-move" draggable="true" data-task-id="${task.id}">
                <div class="flex items-start justify-between mb-2">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">${task.title}</h4>
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${task.description || 'No description'}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </span>
                    <div class="flex space-x-1">
                        <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" onclick="taskManager.editTask('${task.id}')">
                            <i data-lucide="edit" class="w-3 h-3"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onclick="taskManager.deleteTask('${task.id}')">
                            <i data-lucide="trash-2" class="w-3 h-3"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupTaskEventListeners() {
        // Setup drag and drop for board view
        if (this.currentPage === 'board') {
            this.setupDragAndDrop();
        }
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    setupDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.kanban-column');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.dataset.taskId);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.dataset.status;
                
                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    getFilteredTasks() {
        let filtered = this.tasks;
        
        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    }

    openTaskModal(taskId = null) {
        this.editingTask = taskId ? this.tasks.find(t => t.id === taskId) : null;
        
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        title.textContent = this.editingTask ? 'Edit Task' : 'Add New Task';
        
        if (this.editingTask) {
            document.getElementById('taskTitle').value = this.editingTask.title;
            document.getElementById('taskDescription').value = this.editingTask.description || '';
            document.getElementById('taskPriority').value = this.editingTask.priority;
            document.getElementById('taskDueDate').value = this.editingTask.dueDate || '';
        } else {
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.add('hidden');
        this.editingTask = null;
    }

    saveTask() {
        const formData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            status: 'todo'
        };

        if (this.editingTask) {
            // Update existing task
            const index = this.tasks.findIndex(t => t.id === this.editingTask.id);
            this.tasks[index] = { ...this.editingTask, ...formData };
        } else {
            // Create new task
            const newTask = {
                id: this.generateId(),
                ...formData,
                createdAt: new Date().toISOString()
            };
            this.tasks.push(newTask);
        }

        this.saveToStorage();
        this.closeTaskModal();
        this.renderTasks();
    }

    editTask(taskId) {
        this.openTaskModal(taskId);
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveToStorage();
            this.renderTasks();
        }
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveToStorage();
            this.renderTasks();
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Initialize the application
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});
