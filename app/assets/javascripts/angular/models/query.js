//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

angular.module('openproject.models')

.factory('Query', ['Filter', 'Sortation', 'AVAILABLE_WORK_PACKAGE_FILTERS', function(Filter, Sortation, AVAILABLE_WORK_PACKAGE_FILTERS) {

  Query = function (data, options) {
    this.available_work_package_filters = AVAILABLE_WORK_PACKAGE_FILTERS;

    angular.extend(this, data, options);

    this.group_by = this.group_by || '';

    if (this.filters === undefined){
      this.filters = [];
    } else {
      this.filters = this.filters.map(function(filterData){
        return new Filter(filterData);
      });
    }
  };

  Query.prototype = {
    /**
     * @name toParams
     *
     * @description Serializes the query to parameters required by the backend
     * @returns {params} Request parameters
     */
    toParams: function() {

      return angular.extend.apply(this, [
        {
          'f[]': this.getFilterNames(this.getActiveConfiguredFilters()),
          'c[]': this.columns.map(function(column) {
            return column.name;
           }),
          'group_by': this.group_by,
          'query_id': this.id,
          'sort': this.sortation.encode()
        }].concat(this.getActiveConfiguredFilters().map(function(filter) {
          return filter.toParams();
        }))
      );
    },

    getFilterNames: function(filters) {
      return (filters || this.filters).map(function(filter){
        return filter.name;
      });
    },

    getFilterByName: function(filterName) {
      return this.filters.filter(function(filter){
        return filter.name === filterName;
      }).first();
    },

    addFilter: function(filterName, options) {
      var filter = this.getFilterByName(filterName);

      if (filter) {
        filter.deactivated = false;
      } else {
        this.filters.push(new Filter(angular.extend({name: filterName}, options)));
      }
    },

    removeFilter: function(filterName) {
      this.filters.splice(this.getFilterNames().indexOf(filterName), 1);
    },

    deactivateFilter: function(filter, loading) {
      if (!loading) filter.deactivated = true;
    },

    getFilterType: function(filterName) {
      return AVAILABLE_WORK_PACKAGE_FILTERS[filterName].type;
    },

    getActiveFilters: function() {
      return this.filters.filter(function(filter){
        return !filter.deactivated;
      });
    },

    getActiveConfiguredFilters: function() {
      return this.getActiveFilters().filter(function(filter){
        return filter.isConfigured();
      });
    },

    clearAll: function(){
      this.group_by = '';
      this.display_sums = false;
      this.id = null;
      this.clearFilters();
    },

    clearFilters: function(){
      this.filters.map(function(filter){
        filter.deactivated = true;
      });
    },

    // Note: If we pass an id for the query then any changes to filters are ignored by the server and it
    //       just uses the queries filters. Therefor we have to set it to null.
    hasChanged: function(){
      this.id = null;
    },

    setSortation: function(sortation){
      this.sortation = sortation;
    }
  };

  return Query;
}]);