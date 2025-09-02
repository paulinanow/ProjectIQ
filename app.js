// ProjectIQ Task Manager - Main Application
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.nextTaskId = this.loadNextTaskId();
        this.teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
        this.epics = JSON.parse(localStorage.getItem('epics')) || [];
        this.currentPage = 'backlog';
        this.editingTask = null;
        this.searchTerm = '';
        
        // Theme management
        this.themeManager = new ThemeManager();
        
        this.init();
    }

    init() {
        this.initializeIcons();
        this.setupEventListeners();
        this.themeManager.init();
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

        // Team member modal
        document.getElementById('teamMemberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTeamMember();
        });

        document.getElementById('cancelTeamMemberBtn').addEventListener('click', () => {
            this.closeTeamMemberModal();
        });

        // Epic modal
        document.getElementById('epicForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEpic();
        });

        document.getElementById('cancelEpicBtn').addEventListener('click', () => {
            this.closeEpicModal();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.themeManager.toggleTheme();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D for dark mode toggle
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.themeManager.toggleTheme();
            }
        });

        // Close modals on outside click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });

        document.getElementById('teamMemberModal').addEventListener('click', (e) => {
            if (e.target.id === 'teamMemberModal') {
                this.closeTeamMemberModal();
            }
        });

        document.getElementById('epicModal').addEventListener('click', (e) => {
            if (e.target.id === 'epicModal') {
                this.closeEpicModal();
            }
        });

        // Global click handler for edit/delete buttons
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('[data-action="edit-task"]');
            const delBtn = e.target.closest('[data-action="delete-task"]');
            const editEpicBtn = e.target.closest('[data-action="edit-epic"]');
            const cloneEpicBtn = e.target.closest('[data-action="clone-epic"]');
            const delEpicBtn = e.target.closest('[data-action="delete-epic"]');
            
            if (editBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = Number(editBtn.getAttribute('data-id'));
                if (!Number.isNaN(id)) this.editTask(id);
            } else if (delBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = Number(delBtn.getAttribute('data-id'));
                if (!Number.isNaN(id)) this.deleteTask(id);
            } else if (editEpicBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = Number(editEpicBtn.getAttribute('data-id'));
                if (!Number.isNaN(id)) this.openEpicModal(id);
            } else if (cloneEpicBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = Number(cloneEpicBtn.getAttribute('data-id'));
                if (!Number.isNaN(id)) this.cloneEpic(id);
            } else if (delEpicBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = Number(delEpicBtn.getAttribute('data-id'));
                if (!Number.isNaN(id)) this.deleteEpic(id);
            }
        });
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
            board: 'Kanban Board',
            team: 'Team Members',
            epics: 'Epics',
            dashboard: 'Dashboard',
            roadmap: 'Roadmap'
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
        } else if (this.currentPage === 'team') {
            content.innerHTML = this.renderTeamView();
        } else if (this.currentPage === 'epics') {
            content.innerHTML = this.renderEpicsView();
        } else if (this.currentPage === 'dashboard') {
            content.innerHTML = this.renderDashboardView();
        } else if (this.currentPage === 'roadmap') {
            content.innerHTML = this.renderRoadmapView();
        }
        
        this.setupTaskEventListeners();
    }

    renderBacklogView() {
        const filteredTasks = this.getFilteredTasks();
        
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Backlog Items</h3>
                    <button id="addBacklogItemBtn" class="btn-primary">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                        Add Task
                    </button>
                </div>
                
                ${filteredTasks.length === 0 ? `
                    <div class="text-center py-12">
                        <i data-lucide="inbox" class="w-16 h-16 mx-auto mb-4"></i>
                        <h3 class="text-lg font-medium mb-2">No tasks found</h3>
                        <p class="text-muted">${this.searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first task.'}</p>
                    </div>
                ` : `
                    <div class="rounded-lg shadow">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y">
                                <thead>
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">State</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Assigned To</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Priority</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y">
                                    ${filteredTasks.map(task => this.renderTaskRow(task)).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    renderTaskRow(task) {
        const assignee = task.assignee ? this.getMemberName(task.assignee) : 'Unassigned';
        const assigneeInitials = task.assignee ? this.getMemberInitials(task.assignee) : 'U';
        const itemType = task.itemType || 'task';
        
        return `
            <tr class="hover:bg-tertiary transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">${task.id}</td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium cursor-pointer hover:text-accent-primary transition-colors" onclick="taskManager.openTaskModal(${task.id})">${task.title}</div>
                    <div class="text-sm text-muted">${task.description ? task.description.substring(0, 50) + '...' : 'No description'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-xs font-medium bg-accent-primary text-white px-2 py-1 rounded">${itemType}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${task.status}">${task.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="assignee-chip mr-2">${assigneeInitials}</div>
                        <span class="text-sm">${assignee}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button data-action="edit-task" data-id="${task.id}" class="mr-2 hover:text-accent-primary transition-colors">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    <button data-action="delete-task" data-id="${task.id}" class="hover:text-accent-danger transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    renderBoardView() {
        const filteredTasks = this.getFilteredTasks().filter(task => task.itemType !== 'epic');
        const todoTasks = filteredTasks.filter(task => task.status === 'todo');
        const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
        const doneTasks = filteredTasks.filter(task => task.status === 'done');

        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="kanban-column" data-status="todo">
                    <div class="column-header">
                        <h3 class="text-lg font-semibold mb-2">To Do</h3>
                        <span class="column-count bg-tertiary text-secondary px-2 py-1 rounded-full text-xs">${todoTasks.length}</span>
                    </div>
                    <div class="task-list">
                        ${todoTasks.map(task => this.renderTaskCard(task)).join('')}
                        ${todoTasks.length === 0 ? '<div class="empty-drop-hint">Drop tasks here</div>' : ''}
                    </div>
                </div>
                
                <div class="kanban-column" data-status="in-progress">
                    <div class="column-header">
                        <h3 class="text-lg font-semibold mb-2">In Progress</h3>
                        <span class="column-count bg-tertiary text-secondary px-2 py-1 rounded-full text-xs">${inProgressTasks.length}</span>
                    </div>
                    <div class="task-list">
                        ${inProgressTasks.map(task => this.renderTaskCard(task)).join('')}
                        ${inProgressTasks.length === 0 ? '<div class="empty-drop-hint">Drop tasks here</div>' : ''}
                    </div>
                </div>
                
                <div class="kanban-column" data-status="done">
                    <div class="column-header">
                        <h3 class="text-lg font-semibold mb-2">Done</h3>
                        <span class="column-count bg-tertiary text-secondary px-2 py-1 rounded-full text-xs">${doneTasks.length}</span>
                    </div>
                    <div class="task-list">
                        ${doneTasks.map(task => this.renderTaskCard(task)).join('')}
                        ${doneTasks.length === 0 ? '<div class="empty-drop-hint">Drop tasks here</div>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderTaskCard(task) {
        const assignee = task.assignee ? this.getMemberName(task.assignee) : 'Unassigned';
        const assigneeInitials = task.assignee ? this.getMemberInitials(task.assignee) : 'U';
        const itemTypeBadge = task.itemType === 'story' ? 'Story' : 'Task';
        
        return `
            <div class="task-card accent-${task.status}" draggable="true" data-task-id="${task.id}">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium bg-accent-primary text-white px-2 py-1 rounded">${itemTypeBadge}</span>
                        <span class="text-xs font-mono text-muted">#${task.id}</span>
                    </div>
                    <div class="assignee-chip">${assigneeInitials}</div>
                </div>
                <h4 class="font-medium mb-1 cursor-pointer hover:text-accent-primary transition-colors" onclick="taskManager.openTaskModal(${task.id})">${task.title}</h4>
                <p class="text-sm text-muted mb-3 line-clamp-2">${task.description || 'No description'}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                        ${task.dueDate ? `<span class="text-xs text-muted">Due: ${task.dueDate}</span>` : ''}
                    </div>
                    <div class="flex items-center space-x-1">
                        <button data-action="edit-task" data-id="${task.id}" class="p-1 hover:bg-tertiary rounded transition-colors">
                            <i data-lucide="edit-3" class="w-3 h-3"></i>
                        </button>
                        <button data-action="delete-task" data-id="${task.id}" class="p-1 hover:bg-tertiary rounded transition-colors">
                            <i data-lucide="trash-2" class="w-3 h-3"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTeamView() {
        return `
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold transition-colors duration-300">Team Management</h2>
                    <button id="addMemberBtn" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md transition-all duration-300 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                        Add New Team Member
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${this.teamMembers.map(member => `
                        <div class="p-4 rounded-lg border transition-all duration-300 hover:shadow-md">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium transition-colors duration-300">
                                        ${this.getMemberInitials(member.name)}
                                    </div>
                                    <div>
                                        <h3 class="font-medium transition-colors duration-300">${member.name}</h3>
                                        <p class="text-sm transition-colors duration-300">${member.email}</p>
                                    </div>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="taskManager.openTeamMemberModal(${member.id})" 
                                            class="p-1 rounded transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                            title="Edit member">
                                        <svg class="w-4 h-4 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button onclick="taskManager.removeMember(${member.id})" 
                                            class="p-1 rounded transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                            title="Remove member">
                                        <svg class="w-4 h-4 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="text-xs transition-colors duration-300">
                                Added: ${new Date(member.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.teamMembers.length === 0 ? `
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4 transition-colors duration-300">👥</div>
                        <h3 class="text-lg font-medium mb-2 transition-colors duration-300">No Team Members</h3>
                        <p class="transition-colors duration-300">Start building your team by adding the first member.</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderEpicsView() {
        const newEpics = this.epics.filter(epic => epic.status === 'new');
        const activeEpics = this.epics.filter(epic => epic.status === 'active');
        const inProgressEpics = this.epics.filter(epic => epic.status === 'in-progress');
        const doneEpics = this.epics.filter(epic => epic.status === 'done');

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Epic Management</h3>
                    <button id="addEpicBtn" class="btn-primary">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                        Add Epic
                    </button>
                </div>

                <!-- Epic Board View -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <!-- New Epics -->
                    <div class="epic-column" data-status="new">
                        <div class="column-header">
                            <h4 class="text-md font-semibold mb-2">New</h4>
                            <span class="column-count bg-tertiary text-secondary px-2 py-1 rounded-full text-xs">${newEpics.length}</span>
                        </div>
                        <div class="epic-list">
                            ${newEpics.map(epic => this.renderEpicCard(epic)).join('')}
                            ${newEpics.length === 0 ? '<div class="empty-drop-hint">Drop epics here</div>' : ''}
                        </div>
                    </div>

                    <!-- Active Epics -->
                    <div class="epic-column" data-status="active">
                        <div class="column-header">
                            <h4 class="text-md font-semibold mb-2">Active</h4>
                            <span class="column-count bg-tertiary text-secondary px-2 py-1 rounded-full text-xs">${activeEpics.length}</span>
                        </div>
                        <div class="epic-list">
                            ${activeEpics.map(epic => this.renderEpicCard(epic)).join('')}
                            ${activeEpics.length === 0 ? '<div class="empty-drop-hint">Drop epics here</div>' : ''}
                        </div>
                    </div>

                    <!-- In Progress Epics -->
                    <div class="epic-column" data-status="in-progress">
                        <div class="column-header">
                            <h4 class="text-md font-semibold mb-2">In Progress</h4>
                            <span class="column-count bg-tertiary text-secondary px-2 py-1 rounded-full text-xs">${inProgressEpics.length}</span>
                        </div>
                        <div class="epic-list">
                            ${inProgressEpics.map(epic => this.renderEpicCard(epic)).join('')}
                            ${inProgressEpics.length === 0 ? '<div class="empty-drop-hint">Drop epics here</div>' : ''}
                        </div>
                    </div>

                    <!-- Done Epics -->
                    <div class="epic-column" data-status="done">
                        <div class="column-header">
                            <h4 class="text-md font-semibold mb-2">Done</h4>
                            <span class="column-count bg-tertiary text-secondary px-2 py-1 rounded-full text-xs">${doneEpics.length}</span>
                        </div>
                        <div class="epic-list">
                            ${doneEpics.map(epic => this.renderEpicCard(epic)).join('')}
                            ${doneEpics.length === 0 ? '<div class="empty-drop-hint">Drop epics here</div>' : ''}
                        </div>
                    </div>
                                 </div>
             </div>
        `;
    }

    renderEpicCard(epic) {
        const linkedTasks = this.tasks.filter(task => task.epicId === epic.id);
        const completedTasks = linkedTasks.filter(task => task.status === 'done').length;
        const progressPercentage = linkedTasks.length > 0 ? Math.round((completedTasks / linkedTasks.length) * 100) : 0;
        const epicId = `EPIC-${epic.id.toString().padStart(3, '0')}`;
        const owner = epic.owner ? this.getMemberName(epic.owner) : 'Unassigned';

        return `
            <div class="epic-card" draggable="true" data-epic-id="${epic.id}">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-mono text-muted">${epicId}</span>
                        <span class="priority-badge priority-${epic.priority || 'medium'}">${epic.priority || 'medium'}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <button data-action="edit-epic" data-id="${epic.id}" class="p-1 hover:bg-tertiary rounded transition-colors" title="Edit Epic">
                            <i data-lucide="edit-3" class="w-3 h-3"></i>
                        </button>
                        <button data-action="clone-epic" data-id="${epic.id}" class="p-1 hover:bg-tertiary rounded transition-colors" title="Clone Epic">
                            <i data-lucide="copy" class="w-3 h-3"></i>
                        </button>
                        <button data-action="delete-epic" data-id="${epic.id}" class="p-1 hover:bg-tertiary rounded transition-colors" title="Delete Epic">
                            <i data-lucide="trash-2" class="w-3 h-3"></i>
                        </button>
                    </div>
                </div>
                
                <h4 class="font-medium mb-1 cursor-pointer hover:text-accent-primary transition-colors" onclick="taskManager.openEpicModal(${epic.id})">${epic.title}</h4>
                <p class="text-sm text-muted mb-3 line-clamp-2">${epic.description || 'No description'}</p>
                
                <!-- Progress Bar -->
                <div class="mb-3">
                    <div class="flex items-center justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>${progressPercentage}%</span>
                    </div>
                    <div class="w-full bg-tertiary rounded-full h-2">
                        <div class="bg-accent-success h-2 rounded-full transition-all duration-500" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>

                <!-- Epic Details -->
                <div class="space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-muted">Owner:</span>
                        <span>${owner}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-muted">Tasks:</span>
                        <span>${linkedTasks.length} (${completedTasks} done)</span>
                    </div>
                    ${epic.startDate && epic.endDate ? `
                        <div class="flex items-center justify-between">
                            <span class="text-muted">Timeline:</span>
                            <span>${epic.startDate} - ${epic.endDate}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Status Badge -->
                <div class="mt-3">
                    <span class="status-badge status-${epic.status}">${epic.status}</span>
                </div>
            </div>
        `;
    }

    renderDashboardView() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'done').length;
        const inProgressTasks = this.tasks.filter(task => task.status === 'in-progress').length;
        const todoTasks = this.tasks.filter(task => task.status === 'todo').length;
        
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return `
            <div class="space-y-6">
                <h3 class="text-lg font-semibold">Dashboard Overview</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="rounded-lg border p-4">
                        <div class="flex items-center">
                            <div class="p-2 bg-accent-primary rounded-lg">
                                <i data-lucide="list-todo" class="w-6 h-6 text-white"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-muted">Total Tasks</p>
                                <p class="text-2xl font-bold">${totalTasks}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-lg border p-4">
                        <div class="flex items-center">
                            <div class="p-2 bg-accent-success rounded-lg">
                                <i data-lucide="check-circle" class="w-6 h-6 text-white"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-muted">Completed</p>
                                <p class="text-2xl font-bold">${completedTasks}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-lg border p-4">
                        <div class="flex items-center">
                            <div class="p-2 bg-accent-warning rounded-lg">
                                <i data-lucide="clock" class="w-6 h-6 text-white"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-muted">In Progress</p>
                                <p class="text-2xl font-bold">${inProgressTasks}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rounded-lg border p-4">
                        <div class="flex items-center">
                            <div class="p-2 bg-accent-danger rounded-lg">
                                <i data-lucide="alert-circle" class="w-6 h-6 text-white"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-muted">To Do</p>
                                <p class="text-2xl font-bold">${todoTasks}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="rounded-lg border p-6">
                    <h4 class="font-medium mb-4">Progress Overview</h4>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-sm">Overall Progress</span>
                            <span class="text-sm font-medium">${progressPercentage}%</span>
                        </div>
                        <div class="w-full bg-tertiary rounded-full h-2">
                            <div class="bg-accent-success h-2 rounded-full transition-all duration-500" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRoadmapView() {
        const allItems = [...this.epics, ...this.tasks];
        
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Roadmap</h3>
                    <button id="addRoadmapItemBtn" class="btn-primary">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                        Add Item
                    </button>
                </div>
                
                <div class="rounded-lg border p-6">
                    <div class="space-y-4">
                        ${allItems.map(item => `
                            <div class="flex items-center space-x-4 p-3 rounded-lg border hover:bg-tertiary transition-colors">
                                <div class="flex-shrink-0">
                                    <span class="text-xs font-mono text-muted">#${item.id}</span>
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-medium">${item.title}</h4>
                                    <p class="text-sm text-muted">${item.description || 'No description'}</p>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="status-badge status-${item.status}">${item.status}</span>
                                    <span class="priority-badge priority-${item.priority}">${item.priority}</span>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${allItems.length === 0 ? `
                            <div class="text-center py-12">
                                <i data-lucide="calendar-range" class="w-16 h-16 mx-auto mb-4 text-muted"></i>
                                <h3 class="text-lg font-medium mb-2">No roadmap items</h3>
                                <p class="text-muted">Add epics and tasks to see them in your roadmap.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    setupTaskEventListeners() {
        // Team member management
        const addMemberBtn = document.getElementById('addMemberBtn');
        if (addMemberBtn) {
            addMemberBtn.addEventListener('click', () => this.openTeamMemberModal());
        }

        // Add epic button
        const addEpicBtn = document.getElementById('addEpicBtn');
        if (addEpicBtn) {
            addEpicBtn.addEventListener('click', () => this.openEpicModal());
        }

        // Add backlog item button
        const addBacklogItemBtn = document.getElementById('addBacklogItemBtn');
        if (addBacklogItemBtn) {
            addBacklogItemBtn.addEventListener('click', () => this.openTaskModal());
        }

        // Remove member buttons
        document.querySelectorAll('[data-action="remove-member"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const memberId = Number(e.currentTarget.getAttribute('data-id'));
                this.removeMember(memberId);
            });
        });

        // Drag and drop for Kanban board
        this.setupDragAndDrop();

        // Initialize icons after rendering
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    setupDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const dropZones = document.querySelectorAll('.kanban-column[data-status]');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', card.getAttribute('data-task-id'));
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const taskId = Number(e.dataTransfer.getData('text/plain'));
                const newStatus = zone.getAttribute('data-status');
                
                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.renderTasks();
        }
    }

    getFilteredTasks() {
        let filtered = this.tasks;
        
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower) ||
                task.id.toString().includes(searchLower)
            );
        }
        
        return filtered;
    }

    openTaskModal(taskId = null) {
        this.editingTask = taskId ? this.tasks.find(t => t.id === taskId) || this.epics.find(e => e.id === taskId) : null;
        
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        title.textContent = this.editingTask ? 'Task Details' : 'Add New Task';
        
        // Populate form fields
        if (this.editingTask) {
            document.getElementById('taskTitle').value = this.editingTask.title;
            document.getElementById('taskDescription').value = this.editingTask.description || '';
            document.getElementById('taskPriority').value = this.editingTask.priority || 'medium';
            document.getElementById('taskStatus').value = this.editingTask.status || 'todo';
            document.getElementById('taskDueDate').value = this.editingTask.dueDate || '';
            document.getElementById('taskEffort').value = this.editingTask.effort || '';
            document.getElementById('taskCapacity').value = this.editingTask.capacity || '';
            document.getElementById('taskSize').value = this.editingTask.size || '1';
            document.getElementById('taskItemType').value = this.editingTask.itemType || 'task';
            document.getElementById('taskAssignee').value = this.editingTask.assignee || '';
            document.getElementById('taskEpic').value = this.editingTask.epicId || '';
            document.getElementById('taskId').value = this.editingTask.id;
        } else {
            form.reset();
            document.getElementById('taskId').value = this.nextTaskId;
        }
        
        // Populate dropdowns
        this.populateAssigneeDropdown();
        this.populateEpicDropdown();
        
        modal.classList.remove('hidden');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.add('hidden');
        this.editingTask = null;
    }

    saveTask() {
        const formData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDueDate').value,
            effort: document.getElementById('taskEffort').value,
            capacity: document.getElementById('taskCapacity').value,
            size: document.getElementById('taskSize').value,
            itemType: document.getElementById('taskItemType').value,
            assignee: document.getElementById('taskAssignee').value,
            epicId: document.getElementById('taskEpic').value
        };

        // Form validation
        if (!formData.title) {
            alert('Please enter a task title.');
            return;
        }

        if (!formData.itemType) {
            alert('Please select a work item type.');
            return;
        }

        if (this.editingTask) {
            // Update existing task
            Object.assign(this.editingTask, formData);
            
            // Update in appropriate array
            if (this.editingTask.itemType === 'epic') {
                const epicIndex = this.epics.findIndex(e => e.id === this.editingTask.id);
                if (epicIndex !== -1) {
                    this.epics[epicIndex] = this.editingTask;
                }
            } else {
                const taskIndex = this.tasks.findIndex(t => t.id === this.editingTask.id);
                if (taskIndex !== -1) {
                    this.tasks[taskIndex] = this.editingTask;
                }
            }
        } else {
            // Create new task
            const newTask = {
                id: this.nextTaskId,
                ...formData,
                createdAt: new Date().toISOString()
            };
            
            if (newTask.itemType === 'epic') {
                this.epics.push(newTask);
            } else {
                this.tasks.push(newTask);
            }
            
            this.nextTaskId++;
            this.saveNextTaskId();
        }

        this.saveTasks();
        this.saveEpics();
        this.closeTaskModal();
        this.renderTasks();
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this item?')) {
            // Check if it's an epic
            const epicIndex = this.epics.findIndex(e => e.id === taskId);
            if (epicIndex !== -1) {
                this.epics.splice(epicIndex, 1);
                this.saveEpics();
            } else {
                // It's a task
                const taskIndex = this.tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    this.tasks.splice(taskIndex, 1);
                    this.saveTasks();
                }
            }
            this.renderTasks();
        }
    }

    editTask(taskId) {
        this.openTaskModal(taskId);
    }

    openTeamMemberModal(memberId = null) {
        const modal = document.getElementById('teamMemberModal');
        const form = document.getElementById('teamMemberForm');
        const title = modal.querySelector('h3');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        form.reset();
        
        if (memberId) {
            // Edit mode
            const member = this.teamMembers.find(m => m.id === memberId);
            if (member) {
                document.getElementById('memberName').value = member.name;
                document.getElementById('memberEmail').value = member.email;
                form.setAttribute('data-edit-id', memberId);
                title.textContent = 'Edit Team Member';
                submitBtn.textContent = 'Update Member';
            }
        } else {
            // Add mode
            form.removeAttribute('data-edit-id');
            title.textContent = 'Add Team Member';
            submitBtn.textContent = 'Add Member';
        }
        
        modal.classList.remove('hidden');
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    closeTeamMemberModal() {
        document.getElementById('teamMemberModal').classList.add('hidden');
    }

    saveTeamMember() {
        const name = document.getElementById('memberName').value.trim();
        const email = document.getElementById('memberEmail').value.trim();
        const form = document.getElementById('teamMemberForm');
        const editId = form.getAttribute('data-edit-id');
        
        if (!name || !email) {
            alert('Please fill in both name and email fields.');
            return;
        }
        
        if (editId) {
            // Update existing member
            const memberId = Number(editId);
            const memberIndex = this.teamMembers.findIndex(m => m.id === memberId);
            if (memberIndex !== -1) {
                this.teamMembers[memberIndex] = {
                    ...this.teamMembers[memberIndex],
                    name: name,
                    email: email,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new member
            const newMember = {
                id: Date.now(),
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            };
            this.teamMembers.push(newMember);
        }
        
        this.saveTeamMembers();
        this.closeTeamMemberModal();
        this.renderTasks();
    }

    openEpicModal(epicId = null) {
        this.editingEpic = epicId ? this.epics.find(e => e.id === epicId) : null;
        
        const modal = document.getElementById('epicModal');
        const title = document.getElementById('epicModalTitle');
        const form = document.getElementById('epicForm');
        
        title.textContent = this.editingEpic ? 'Edit Epic' : 'Add New Epic';
        
        // Populate form fields
        if (this.editingEpic) {
            document.getElementById('epicId').value = `EPIC-${this.editingEpic.id.toString().padStart(3, '0')}`;
            document.getElementById('epicTitle').value = this.editingEpic.title;
            document.getElementById('epicDescription').value = this.editingEpic.description || '';
            document.getElementById('epicAcceptanceCriteria').value = this.editingEpic.acceptanceCriteria || '';
            document.getElementById('epicStatus').value = this.editingEpic.status || 'new';
            document.getElementById('epicPriority').value = this.editingEpic.priority || 'medium';
            document.getElementById('epicSize').value = this.editingEpic.size || '1';
            document.getElementById('epicOwner').value = this.editingEpic.owner || '';
            document.getElementById('epicStartDate').value = this.editingEpic.startDate || '';
            document.getElementById('epicEndDate').value = this.editingEpic.endDate || '';
            document.getElementById('epicEstimatedEffort').value = this.editingEpic.estimatedEffort || '';
            document.getElementById('epicActualEffort').value = this.editingEpic.actualEffort || '';
        } else {
            form.reset();
            document.getElementById('epicId').value = `EPIC-${this.nextTaskId.toString().padStart(3, '0')}`;
        }
        
        // Populate owner dropdown
        this.populateEpicOwnerDropdown();
        
        modal.classList.remove('hidden');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    closeEpicModal() {
        document.getElementById('epicModal').classList.add('hidden');
        this.editingEpic = null;
    }

    saveEpic() {
        const formData = {
            title: document.getElementById('epicTitle').value.trim(),
            description: document.getElementById('epicDescription').value.trim(),
            acceptanceCriteria: document.getElementById('epicAcceptanceCriteria').value.trim(),
            status: document.getElementById('epicStatus').value,
            priority: document.getElementById('epicPriority').value,
            size: document.getElementById('epicSize').value,
            owner: document.getElementById('epicOwner').value,
            startDate: document.getElementById('epicStartDate').value,
            endDate: document.getElementById('epicEndDate').value,
            estimatedEffort: document.getElementById('epicEstimatedEffort').value,
            actualEffort: document.getElementById('epicActualEffort').value
        };

        // Form validation
        if (!formData.title) {
            alert('Please enter an epic title.');
            return;
        }

        if (this.editingEpic) {
            // Update existing epic
            Object.assign(this.editingEpic, formData);
            const epicIndex = this.epics.findIndex(e => e.id === this.editingEpic.id);
            if (epicIndex !== -1) {
                this.epics[epicIndex] = this.editingEpic;
            }
        } else {
            // Create new epic
            const newEpic = {
                id: this.nextTaskId,
                ...formData,
                createdAt: new Date().toISOString()
            };
            this.epics.push(newEpic);
            this.nextTaskId++;
            this.saveNextTaskId();
        }

        this.saveEpics();
        this.closeEpicModal();
        this.renderTasks();
    }

    populateEpicOwnerDropdown() {
        const select = document.getElementById('epicOwner');
        select.innerHTML = '<option value="">Select Owner</option>';
        
        this.teamMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            select.appendChild(option);
        });
    }

    cloneEpic(epicId) {
        const epicToClone = this.epics.find(e => e.id === epicId);
        if (epicToClone) {
            const newEpic = {
                ...epicToClone,
                id: this.nextTaskId,
                title: `${epicToClone.title} (Copy)`,
                createdAt: new Date().toISOString()
            };
            this.epics.push(newEpic);
            this.nextTaskId++;
            this.saveNextTaskId();
            this.saveEpics();
            this.renderTasks();
            alert('Epic cloned successfully!');
        } else {
            alert('Epic not found.');
        }
    }

    deleteEpic(epicId) {
        if (confirm('Are you sure you want to delete this epic?')) {
            this.epics = this.epics.filter(e => e.id !== epicId);
            this.saveEpics();
            this.renderTasks();
        }
    }

    addTeamMember() {
        const name = prompt('Enter team member name:');
        if (!name) return;
        
        const email = prompt('Enter team member email:');
        if (!email) return;
        
        const member = {
            id: Date.now(),
            name: name.trim(),
            email: email.trim()
        };
        
        this.teamMembers.push(member);
        this.saveTeamMembers();
        this.renderTasks();
    }

    removeMember(memberId) {
        if (confirm('Are you sure you want to remove this team member?')) {
            this.teamMembers = this.teamMembers.filter(m => m.id !== memberId);
            this.saveTeamMembers();
            this.renderTasks();
        }
    }

    getMemberName(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        return member ? member.name : 'Unknown';
    }

    getMemberInitials(name) {
        if (!name) return 'U';
        
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    populateAssigneeDropdown() {
        const select = document.getElementById('taskAssignee');
        select.innerHTML = '<option value="">Select Assignee</option>';
        
        this.teamMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            select.appendChild(option);
        });
    }

    populateEpicDropdown() {
        const select = document.getElementById('taskEpic');
        select.innerHTML = '<option value="">Select Epic</option>';
        
        this.epics.forEach(epic => {
            const option = document.createElement('option');
            option.value = epic.id;
            option.textContent = epic.title;
            select.appendChild(option);
        });
    }

    // Storage methods
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    saveEpics() {
        localStorage.setItem('epics', JSON.stringify(this.epics));
    }

    saveTeamMembers() {
        localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
    }

    loadNextTaskId() {
        return parseInt(localStorage.getItem('nextTaskId')) || 1;
    }

    saveNextTaskId() {
        localStorage.setItem('nextTaskId', this.nextTaskId.toString());
    }
}

// Theme Manager Class
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeToggle = document.getElementById('darkModeToggle');
    }

    init() {
        this.loadTheme();
        this.setupSystemPreferenceListener();
    }

    loadTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Check system preference
            this.setThemeFromSystemPreference();
        }
    }

    setThemeFromSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }
    }

    setupSystemPreferenceListener() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        
        // Update data attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update localStorage
        localStorage.setItem('theme', theme);
        
        // Update toggle button
        this.updateToggleButton();
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Provide visual feedback
        this.showThemeTransition();
    }

    updateToggleButton() {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('i');
        const text = this.themeToggle.querySelector('.theme-text');
        
        if (this.currentTheme === 'dark') {
            icon.setAttribute('data-lucide', 'sun');
            text.textContent = 'Light Mode';
        } else {
            icon.setAttribute('data-lucide', 'moon');
            text.textContent = 'Dark Mode';
        }
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    showThemeTransition() {
        // Add a brief flash effect to indicate theme change
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--bg-primary);
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(flash);
        
        // Flash effect
        setTimeout(() => flash.style.opacity = '0.1', 0);
        setTimeout(() => flash.style.opacity = '0', 300);
        setTimeout(() => document.body.removeChild(flash), 600);
    }
}

// Initialize the application
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});
