angular.module('openproject.workPackages.controllers')

.controller('WorkPackagesController', ['$scope', 'WorkPackagesTableHelper', 'Query', 'Sortation', 'WorkPackageService', function($scope, WorkPackagesTableHelper, Query, Sortation, WorkPackageService) {

  function initialSetup() {
    $scope.projectIdentifier = gon.project_identifier;
    $scope.operatorsAndLabelsByFilterType = gon.operators_and_labels_by_filter_type;
    $scope.loading = false;
    $scope.disableFilters = false;
  }

  function setupQuery() {
    $scope.query = new Query(gon.query);

    sortation = new Sortation(gon.sort_criteria);
    $scope.query.setSortation(sortation);

    // Columns
    $scope.columns = gon.columns;
    $scope.availableColumns = WorkPackagesTableHelper.getColumnDifference(gon.available_columns, $scope.columns);

    $scope.currentSortation = gon.sort_criteria;

    angular.extend($scope.query, {
      selectedColumns: $scope.columns
    });
  };

  $scope.submitQueryForm = function(){
    jQuery("#selected_columns option").attr('selected',true);
    jQuery('#query_form').submit();
    return false;
  };

  function setupPagination(json) {
    $scope.paginationOptions = {
      page: json.page,
      perPage: json.per_page
    };
    $scope.perPageOptions = json.per_page_options;
  }

  $scope.setupWorkPackagesTable = function(json) {
    $scope.workPackageCountByGroup = json.work_package_count_by_group;
    $scope.rows = WorkPackagesTableHelper.getRows(json.work_packages, $scope.query.group_by);
    $scope.totalSums = json.sums;
    $scope.groupSums = json.group_sums;
    $scope.totalEntries = json.total_entries;

    setupPagination(json);
  };

  // Initially setup scope via gon
  initialSetup();
  setupQuery(gon);
  // Initialize work package table
  $scope.setupWorkPackagesTable(gon);

  $scope.updateResults = function() {
    $scope.withLoading(WorkPackageService.getWorkPackages, [$scope.projectIdentifier, $scope.query, $scope.paginationOptions])
      .then($scope.setupWorkPackagesTable);
  };


  function serviceErrorHandler(data) {
    // TODO RS: This is where we'd want to put an error message on the dom
    $scope.loading = false;
  }

  /**
   * @name withLoading
   *
   * @description Wraps a data-loading function and manages the loading state within the scope
   * @param {function} callback Function returning a promise
   * @param {array} params Params forwarded to the callback
   * @returns {promise} Promise returned by the callback
   */
  $scope.withLoading = function(callback, params){
    startedLoading();
    return callback.apply(this, params)
      .then(function(data){
        finishedLoading();
        return data;
      }, serviceErrorHandler);
  };

  function startedLoading() {
    $scope.loading = true;
  }

  function finishedLoading() {
    $scope.loading = false;
  }
}]);