/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class TaskModel extends BaseModel {
  static get tableName() {
    return 'task';
  }

  static get idColumn() {
    return 'task_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['due_date', 'task_type_id'],

      properties: {
        task_id: { type: 'integer' },
        task_type_id: { type: 'integer' },
        due_date: { type: 'date-time' },
        notes: { type: ['string', null], maxLength: 10000 },
        completion_notes: { type: ['string', null], maxLength: 10000 },
        owner_user_id: { type: 'string' },
        assignee_user_id: { type: ['string', null] },
        coordinates: { type: 'object' },
        duration: { type: ['number', null] },
        wage_at_moment: { type: ['number', null] },
        happiness: { anyOf: [{ type: 'integer', minimum: 0, maximum: 5 }, { type: 'null' }] },
        complete_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        late_time: { type: ['date-time', null] },
        for_review_time: { type: ['date-time', null] },
        abandon_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        abandonment_reason: {
          type: 'string',
          enum: [
            'OTHER',
            'CROP_FAILURE',
            'LABOUR_ISSUE',
            'MARKET_PROBLEM',
            'WEATHER',
            'MACHINERY_ISSUE',
            'SCHEDULING_ISSUE',
          ],
        },
        other_abandonment_reason: { type: ['string', null] },
        abandonment_notes: { type: ['string', null], maxLength: 10000 },
        override_hourly_wage: { type: 'boolean' },
        ...super.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      soil_amendment_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./soilAmendmentTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'soil_amendment_task.task_id',
        },
      },
      pest_control_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./pestControlTask'),
        join: {
          from: 'task.task_id',
          to: 'pest_control_task.task_id',
        },
      },
      irrigation_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./irrigationTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'irrigation_task.task_id',
        },
      },
      scouting_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./scoutingTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'scouting_task.task_id',
        },
      },
      soil_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./soilTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'soil_task.task_id',
        },
      },
      field_work_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./fieldWorkTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'field_work_task.task_id',
        },
      },
      harvest_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./harvestTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'harvest_task.task_id',
        },
      },
      cleaning_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./cleaningTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'cleaning_task.task_id',
        },
      },

      taskType: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./taskTypeModel'),
        join: {
          from: 'task.task_type_id',
          to: 'task_type.task_type_id',
        },
      },
      plant_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./plantTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'plant_task.task_id',
        },
      },
      transplant_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./transplantTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'transplant_task.task_id',
        },
      },
      //TODO: rename to plantingManagementPlans
      managementPlans: {
        modelClass: require('./plantingManagementPlanModel'),
        relation: Model.ManyToManyRelation,
        join: {
          from: 'task.task_id',
          through: {
            modelClass: require('./managementTasksModel'),
            from: 'management_tasks.task_id',
            to: 'management_tasks.planting_management_plan_id',
          },
          to: 'planting_management_plan.planting_management_plan_id',
        },
      },
      locations: {
        modelClass: require('./locationModel'),
        relation: Model.ManyToManyRelation,
        join: {
          from: 'task.task_id',
          through: {
            modelClass: require('./locationTasksModel'),
            from: 'location_tasks.task_id',
            to: 'location_tasks.location_id',
          },
          to: 'location.location_id',
        },
      },
    };
  }

  /**
   * Gets the assignee of a task.
   * @param {number} taskId - the ID of the task.
   * @static
   * @async
   * @returns {Object} - Object {assignee_user_id, assignee_role_id, wage_at_moment, override_hourly_wage}
   */
  static async getTaskAssignee(taskId) {
    return await TaskModel.query()
      .whereNotDeleted()
      .join('users', 'task.assignee_user_id', 'users.user_id')
      .join('userFarm as uf', 'users.user_id', 'uf.user_id')
      .join('role', 'role.role_id', 'uf.role_id')
      .select(
        TaskModel.knex().raw(
          'users.user_id as assignee_user_id, role.role_id as assignee_role_id, task.wage_at_moment, task.override_hourly_wage',
        ),
      )
      .where('task.task_id', taskId)
      .first();
  }

  /**
   * Gets the type of a task
   * @param taskId {number} - id of the Task.
   * @return {Promise<Object>}
   * @static
   * @async
   */
  static async getTaskType(taskId) {
    return await TaskModel.query()
      .join('task_type', 'task.task_type_id', 'task_type.task_type_id')
      .whereNotDeleted()
      .select('task_type.*')
      .where('task.task_id', taskId)
      .first();
  }

  /**
   * Gets the tasks that are due this week and are unassigned
   * @param {number} taskIds - the IDs of the task.
   * @static
   * @async
   * @returns {Object} - Object {task_type_id, task_id}
   */
  static async getUnassignedTasksDueThiWeekFromIds(taskIds, utcOffset) {
    const startIntervalStr = `"${utcOffset} SECONDS"`;
    const endIntervalStr = `"1 WEEK ${utcOffset} SECONDS"`;
    return await TaskModel.query().select('*').whereIn('task_id', taskIds).whereRaw(
      `
      task.assignee_user_id IS NULL
      AND task.complete_date IS NULL
      AND task.abandon_date IS NULL
      AND task.due_date <= ((NOW() AT TIME ZONE 'utc') + (?)::INTERVAL )::DATE
      AND task.due_date >= ((NOW() AT TIME ZONE 'utc') + (?)::INTERVAL )::DATE
      `,
      [endIntervalStr, startIntervalStr],
    );
  }

  /**
   * Gets the tasks that are due this week and are unassigned
   * @param {uuid} taskId - the ID of the task whose status is being checked
   * @static
   * @async
   * @returns {Object} - Object {complete_date, abandon_date, assignee_user_id, task_translation_key}
   */
  static async getTaskStatus(taskId) {
    return await TaskModel.query()
      .leftOuterJoin('task_type', 'task.task_type_id', 'task_type.task_type_id')
      .select('complete_date', 'abandon_date', 'assignee_user_id', 'task_translation_key')
      .where('task_id', taskId)
      .andWhere('task.deleted', false)
      .first();
  }

  /**
   * Assign the task to the user with the given assigneeUserId.
   * @param {uuid} taskId - the ID of the task
   * @param {uuid} assigneeUserId - the ID of user whose the task is being assigned too
   * @param {Object} user - the user who requested this task assignment
   * @static
   * @async
   * @returns {Object} - Task Object
   */
  static async assignTask(taskId, assigneeUserId, user) {
    return await TaskModel.query()
      .context(user)
      .patchAndFetchById(taskId, { assignee_user_id: assigneeUserId });
  }

  /**
   * Assign tasks to the user with the given assigneeUserId.
   * @param {uuid} taskIds - the IDs of the tasks
   * @param {uuid} assigneeUserId - the ID of user whose the task is being assigned too
   * @param {Object} user - the user who requested this task assignment
   * @static
   * @async
   * @returns {Object} - Task Object
   */
  static async assignTasks(taskIds, assigneeUserId, user) {
    return await TaskModel.query()
      .context(user)
      .patch({
        assignee_user_id: assigneeUserId,
      })
      .whereIn('task_id', taskIds);
  }

  /**
   * Checks whether a given user in a given farm has tasks that are due today.
   * @param {string} userId user id
   * @param {Array} taskIds task ids from a farm
   * @static
   * @async
   * @returns {boolean} true if the user has tasks due today or false if not
   */
  static async hasTasksDueTodayForUserFromFarm(userId, taskIds) {
    const tasksDueToday = await TaskModel.query()
      .select('*')
      .whereIn('task_id', taskIds)
      .whereNotDeleted()
      .andWhere('task.assignee_user_id', userId)
      .andWhere('task.due_date', new Date());

    return tasksDueToday && tasksDueToday.length;
  }

  /**
   * Returns all available tasks on the given date from the given taskIds
   * Available in this case means unassigned, incomplete, not abandoned, and not deleted
   * @param {Array} taskIds - taskIds to search
   * @param {string} date - the date to search
   * @param {Object} user - the user who requested this task assignment
   * @static
   * @async
   * @returns {Object} - Task Object.
   */
  static async getAvailableTasksOnDate(taskIds, date, user) {
    return await TaskModel.query()
      .leftOuterJoin('task_type', 'task.task_type_id', 'task_type.task_type_id')
      .context(user)
      .select('*')
      .where((builder) => {
        builder.where('task.due_date', date);
        builder.whereIn('task.task_id', taskIds);
        builder.where('task.assignee_user_id', null);
        builder.where('task.complete_date', null);
        builder.where('task.abandon_date', null);
        builder.where('task.deleted', false);
      });
  }
}

module.exports = TaskModel;
