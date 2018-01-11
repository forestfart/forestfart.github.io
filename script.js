$(document).ready(function() {
  const apiRoot = 'http://localhost:8080/v1/task/';
  const trelloApiRoot = 'http://localhost:8080/v1/trello/';
  const datatableRowTemplate = $('[data-datatable-row-template]').children()[0];
  const $tasksContainer = $('[data-tasks-container]');

  var availableBoards = {};
  var availableTasks = {};

  // init

  getAllTasks();

  function getAllAvailableBoards(callback, callbackArgs) {
    var requestUrl = trelloApiRoot + 'getTrelloBoards';

    $.ajax({
      url: requestUrl,
      method: 'GET',
      contentType: 'application/json',
      success: function(boards) { callback(callbackArgs, boards); }
    });
  }

  function createElement(data) {
    const element = $(datatableRowTemplate).clone();

    element.attr('data-task-id', data.id);
    element.find('[data-task-name-section] [data-task-name-paragraph]').text(data.title);
    element.find('[data-task-name-section] [data-task-name-input]').val(data.title);

    element.find('[data-task-content-section] [data-task-content-paragraph]').text(data.content);
    element.find('[data-task-content-section] [data-task-content-input]').val(data.content);

    return element;
  }

  function prepareBoardOrListSelectOptions(availableChoices) {
    return availableChoices.map(function(choice) {
      return $('<option>')
                .addClass('crud-select__option')
                .val(choice.id)
                .text(choice.name || 'Unknown name');
    });
  }

  function handleDatatableRender(taskData, boards) {
    $tasksContainer.empty();
    boards.forEach(board => {
      availableBoards[board.id] = board;
    });

    taskData.forEach(function(task) {
      var $datatableRowEl = createElement(task);
      var $availableBoardsOptionElements = prepareBoardOrListSelectOptions(boards);

      $datatableRowEl.find('[data-board-name-select]')
        .append($availableBoardsOptionElements);

      $datatableRowEl
        .appendTo($tasksContainer);
    });
  }

  function getAllTasks() {
    const requestUrl = apiRoot + 'getTasks';

    $.ajax({
      url: requestUrl,
      method: 'GET',
      contentType: "application/json",
      success: function(tasks) {
        tasks.forEach(task => {
          availableTasks[task.id] = task;
        });

        getAllAvailableBoards(handleDatatableRender, tasks);
      }
    });
  }

  function handleTaskUpdateRequest() {
    var parentEl = $(this).parents('[data-task-id]');
    var taskId = parentEl.attr('data-task-id');
    var taskTitle = parentEl.find('[data-task-name-input]').val();
    var taskContent = parentEl.find('[data-task-content-input]').val();
    var requestUrl = apiRoot + 'updateTask';

    $.ajax({
      url: requestUrl,
      method: "PUT",
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        id: taskId,
        title: taskTitle,
        content: taskContent
      }),
      success: function(data) {
       