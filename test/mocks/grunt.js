var tasks = [];

module.exports = {
    tasks: tasks,
    registerMultiTask: function(name, description, taskFn){
        this.tasks.push({
            name: name,
            description: description,
            taskFn: taskFn
        })
    }
};