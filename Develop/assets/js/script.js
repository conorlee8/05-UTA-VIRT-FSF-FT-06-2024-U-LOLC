// scripts.js

$(document).ready(function() {
    const taskModal = $('#task-modal');
    const taskForm = $('#task-form');
    const newTaskBtn = $('#new-task-btn');
    const closeBtn = $('.close-btn');
    const columns = $('.column');
  
    function loadTasks() {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        $(`#${task.status}`).append(taskCard);
      });
      updateTaskColors();
    }
  
    function saveTask(task) {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    function deleteTask(taskId) {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.filter(task => task.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    function createTaskCard(task) {
      const formattedDeadline = dayjs(task.deadline).format('MMMM D, YYYY');
      const taskCard = $(`
        <div class="task-card" data-id="${task.id}">
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <p>Deadline: ${formattedDeadline}</p>
          <button class="delete-btn">Delete</button>
        </div>
      `);
      taskCard.draggable({ revert: true });
      taskCard.on('dragstart', function() {
        $(this).addClass('dragging');
      });
      taskCard.on('dragend', function() {
        $(this).removeClass('dragging');
      });
      taskCard.find('.delete-btn').click(function() {
        const taskId = $(this).parent().data('id');
        deleteTask(taskId);
        $(this).parent().remove();
      });
      return taskCard;
    }
  
    function updateTaskColors() {
      $('.task-card').each(function() {
        const deadlineText = $(this).find('p:last-child').text().split(': ')[1];
        const deadline = dayjs(deadlineText, 'MMMM D, YYYY');
        const today = dayjs();
        const diff = deadline.diff(today, 'day');
  
        console.log('Task deadline:', deadlineText, 'Days difference:', diff); // Debug log
  
        $(this).removeClass('overdue near-deadline');
  
        if (diff < 0) {
          console.log('Adding overdue class'); // Debug log
          $(this).addClass('overdue');
        } else if (diff <= 3) {
          console.log('Adding near-deadline class'); // Debug log
          $(this).addClass('near-deadline');
        }
      });
    }
  
    newTaskBtn.click(function() {
      taskModal.show();
    });
  
    closeBtn.click(function() {
      taskModal.hide();
    });
  
    taskForm.submit(function(event) {
      event.preventDefault();
      const title = $('#title').val();
      const description = $('#description').val();
      const deadline = $('#deadline').val();
      const task = {
        id: Date.now(),
        title,
        description,
        deadline,
        status: 'not-started'
      };
      const taskCard = createTaskCard(task);
      $('#not-started').append(taskCard);
      saveTask(task);
      taskModal.hide();
      taskForm[0].reset();
      updateTaskColors();
    });
  
    columns.droppable({
      accept: '.task-card',
      drop: function(event, ui) {
        const taskCard = ui.helper;
        const status = $(this).data('status');
        taskCard.appendTo($(this).find('.task-list'));
        const taskId = taskCard.data('id');
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(task => {
          if (task.id === taskId) {
            task.status = status;
          }
          return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskColors();
      }
    });
  
    loadTasks();
  });
  