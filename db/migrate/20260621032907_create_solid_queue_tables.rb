class CreateSolidQueueTables < ActiveRecord::Migration[8.0]
  def change
    create_table :solid_queue_jobs, id: :bigserial do |t|
      t.string :queue_name, null: false
      t.string :class_name, null: false
      t.text :arguments
      t.integer :priority, default: 0, null: false
      t.string :active_job_id
      t.datetime :scheduled_at
      t.datetime :finished_at
      t.string :concurrency_key
      t.timestamps
      t.index [ :queue_name, :finished_at ], name: "index_solid_queue_jobs_for_filtering"
      t.index [ :active_job_id ], name: "index_solid_queue_jobs_on_active_job_id"
    end

    create_table :solid_queue_scheduled_executions, id: :bigserial do |t|
      t.bigint :job_id, null: false
      t.datetime :scheduled_at, null: false
      t.integer :priority, default: 0, null: false
      t.timestamps
      t.index [ :scheduled_at, :priority, :job_id ], name: "index_solid_queue_dispatch_all"
      t.index [ :job_id ], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    end

    create_table :solid_queue_ready_executions, id: :bigserial do |t|
      t.bigint :job_id, null: false
      t.string :queue_name, null: false
      t.integer :priority, default: 0, null: false
      t.timestamps
      t.index [ :priority, :job_id ], name: "index_solid_queue_poll_all"
      t.index [ :queue_name, :priority, :job_id ], name: "index_solid_queue_poll_by_queue"
      t.index [ :job_id ], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    end

    create_table :solid_queue_claimed_executions, id: :bigserial do |t|
      t.bigint :job_id, null: false
      t.bigint :process_id
      t.timestamps
      t.index [ :process_id, :job_id ], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
      t.index [ :job_id ], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    end

    create_table :solid_queue_blocked_executions, id: :bigserial do |t|
      t.bigint :job_id, null: false
      t.string :queue_name, null: false
      t.string :concurrency_key, null: false
      t.datetime :expires_at, null: false
      t.timestamps
      t.index [ :concurrency_key, :expires_at, :job_id ], name: "index_solid_queue_blocked_by_key"
      t.index [ :expires_at, :job_id ], name: "index_solid_queue_blocked_by_expiry"
      t.index [ :job_id ], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
    end

    create_table :solid_queue_failed_executions, id: :bigserial do |t|
      t.bigint :job_id, null: false
      t.text :exception_class
      t.text :message
      t.text :backtrace
      t.timestamps
      t.index [ :job_id ], name: "index_solid_queue_failed_executions_on_job_id", unique: true
    end

    create_table :solid_queue_processes, id: :bigserial do |t|
      t.string :kind, null: false
      t.datetime :last_heartbeat_at, null: false
      t.bigint :supervisor_id
      t.integer :pid, null: false
      t.string :hostname
      t.text :metadata
      t.timestamps
      t.index [ :last_heartbeat_at ], name: "index_solid_queue_processes_on_last_heartbeat_at"
      t.index [ :supervisor_id ], name: "index_solid_queue_processes_on_supervisor_id"
    end

    create_table :solid_queue_pauses, id: :bigserial do |t|
      t.string :queue_name, null: false
      t.timestamps
      t.index [ :queue_name ], name: "index_solid_queue_pauses_on_queue_name", unique: true
    end

    create_table :solid_queue_recurring_tasks, id: :bigserial do |t|
      t.string :key, null: false
      t.string :schedule, null: false
      t.string :command, limit: 2048
      t.string :class_name
      t.text :arguments
      t.string :queue_name
      t.integer :priority, default: 0
      t.boolean :static, default: true, null: false
      t.text :description
      t.timestamps
      t.index [ :key ], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    end

    create_table :solid_queue_recurring_executions, id: :bigserial do |t|
      t.bigint :job_id, null: false
      t.string :task_key, null: false
      t.datetime :run_at, null: false
      t.timestamps
      t.index [ :job_id ], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
      t.index [ :task_key, :run_at ], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
    end

    create_table :solid_queue_semaphores, id: :bigserial do |t|
      t.string :key, null: false
      t.integer :value, default: 1, null: false
      t.datetime :expires_at, null: false
      t.timestamps
      t.index [ :key, :value ], name: "index_solid_queue_semaphores_on_key_and_value"
      t.index [ :expires_at ], name: "index_solid_queue_semaphores_on_expires_at"
      t.index [ :key ], name: "index_solid_queue_semaphores_on_key", unique: true
    end

    add_foreign_key :solid_queue_scheduled_executions, :solid_queue_jobs, column: :job_id, on_delete: :cascade
    add_foreign_key :solid_queue_ready_executions, :solid_queue_jobs, column: :job_id, on_delete: :cascade
    add_foreign_key :solid_queue_claimed_executions, :solid_queue_jobs, column: :job_id, on_delete: :cascade
    add_foreign_key :solid_queue_blocked_executions, :solid_queue_jobs, column: :job_id, on_delete: :cascade
    add_foreign_key :solid_queue_failed_executions, :solid_queue_jobs, column: :job_id, on_delete: :cascade
    add_foreign_key :solid_queue_recurring_executions, :solid_queue_jobs, column: :job_id, on_delete: :cascade
  end
end
