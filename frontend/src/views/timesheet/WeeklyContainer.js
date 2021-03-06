
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import DatePicker from 'react-date-picker';
import WeekToolbar from './WeekToolbar';
import TimeInput from './TimeInput';

import AddTaskDialog from './AddTaskDialog';

import TimesheetRequests from './helper/TimesheetRequests';
import WeekUtility from './helper/WeekUtility';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8*3,
  },
  paper: {
    padding: 10,
    textAlign: 'left',
    align: 'left',
    color: theme.palette.text.secondary,
    margin: 0,
    fontSize: 'small'
  },
  paper2: {
    padding: 12,
    textAlign: 'right',
    align: 'center',
    color: theme.palette.text.secondary,
    margin: 0,
    fontSize: 'small'
  },
  paperRow: {
    padding: 6,
    textAlign: 'left',
    align: 'center',
    color: theme.palette.text.secondary,
    margin: 0,
    fontSize: 'small'
  },
  paperHeader: {
    padding: theme.spacing.unit * 2,
    textAlign: 'left',
    align: 'center',
    margin: 0,
    backgroundColor: '#eff5fb',
  },
  paperHeaderBg: {
    backgroundColor: '#eff5fb',
  }
});

class WeeklyContainer extends React.Component {
  constructor(props) {
    super(props);

    let baseDate = new Date();
    baseDate.setHours(0,0,0,0);

    let baseWeekDates = WeekUtility.getWeekDates(baseDate);

    this.taskMinutes = [];

    this.state = {
      dateToday: baseDate,
      selectedDate: baseDate,
      weekDates: baseWeekDates,
      tasks: [],
      taskMinutes: [],
      saving: false,
      taskOthers: [],
      taskAddOpen: false
    };
  }

  componentDidMount() {
    TimesheetRequests.getTasksForThisWeek(tasks => this.onTasksReceived(tasks));
  }

  componentWillUnmount() {
    this.taskMinutes.splice(0, this.taskMinutes.length);
  }

  onUpdateTaskMinutesStateCompleted = () => {
    
  }

  updateTaskMinutesState = (taskMinutes) => {
    this.setState({taskMinutes}, () => this.onUpdateTaskMinutesStateCompleted());
  }

  updateTaskMinutesValue = (minutes, row) => {
    minutes.map((entry, index) => {
      let day = WeekUtility.getDay(new Date(entry.intendedDate));
      this.taskMinutes[(row * 7) + day] = entry.numberOfMinutes;

      if (index === (minutes.length - 1)) {
        this.updateTaskMinutesState(this.taskMinutes);
      }
    });
  }

  onTasksToAddReceived = (taskOthers) => {
    // remove those already in tasks[]
    for (let othersIdx = taskOthers.length - 1; othersIdx > 0; othersIdx--) {
      let found = false;
  
      for (let tempIdx = 0; tempIdx < this.state.tasks.length; tempIdx++) {
  
        let othersEntry = taskOthers[othersIdx];
        let tasksEntry = this.state.tasks[tempIdx];
  
        if (othersEntry.id === tasksEntry.id) {
          found = true;
          break;
        }
      }
  
      // if in intersection, remove in existing array
      if (found) {
        taskOthers.splice(othersIdx, 1);
      }
    }

    this.setState({taskOthers});
  }

  onUpdateTasksStateCompleted = () => {
    // TODO: maybe move this on dialog window show
    TimesheetRequests.getTasksToAddForTimesheet(this.state.weekDates[6],
      taskOthers => this.onTasksToAddReceived(taskOthers));
  }

  updateTasksState = (tasks) => {
    this.setState({tasks}, () => this.onUpdateTasksStateCompleted());
  }

  onTasksReceived = (tasks) => {
    let startDate = this.state.weekDates[0];
    let endDate = this.state.weekDates[6];

    this.taskMinutes.splice(0, this.taskMinutes.length);

    if (tasks.length > 0) {
      for (let i = 0; i < tasks.length * 7; i++) {
        this.taskMinutes.push(0);
      }
  
      tasks.map((task, index) => {
        TimesheetRequests.getTaskMinutesForDates(
          task.id, startDate, endDate, minutes => {
            this.updateTaskMinutesValue(minutes, index);
  
            if (index === tasks.length - 1) {
              this.updateTasksState(tasks);
            }
          }
        );
      });
    }
    else {
      this.updateTaskMinutesState([]);
      this.updateTasksState([]);
    }
  }

  updateTasksAccdgToDate = () => {
    if (WeekUtility.isDateWithinWeek(this.state.dateToday, this.state.weekDates)) {
      TimesheetRequests.getTasksForThisWeek(
        tasks => this.onTasksReceived(tasks)
      );
    } else {
      TimesheetRequests.getTasksForSpecificDates(this.state.weekDates[0], this.state.weekDates[6],
        tasks => this.onTasksReceived(tasks));
    }
  }

  onUpdateDateStateCompleted = () => {
    let weekDates = WeekUtility.getWeekDates(this.state.selectedDate);
    this.setState({weekDates}, () => this.updateTasksAccdgToDate());
  }

  updateDateState = (selectedDate) => {
    this.setState({selectedDate}, () => this.onUpdateDateStateCompleted());
  }

  onCalendarChange = (date) => {
    this.updateDateState(date);
  }

  onTimeCellChange = (idStr, minutes) => {
    let index = parseInt(idStr);
    this.taskMinutes[index] = minutes;
  }

  onFinishedSave = () => {

  }

  onClickSave = () => {
    // 1) check which cells had their values updated
    // 2) if a cell's value was updated send a post request to update time

    this.taskMinutes.forEach((minutes, index) => {
      // for now, check only if minutes is not zero
      if (minutes != 0) {
        let dayIndex = index % 7;
        let taskIndex = Math.floor(index / 7);
        let task = this.state.tasks[taskIndex];

        TimesheetRequests.updateTaskMinutes(minutes, task.id, this.state.weekDates[dayIndex]);
      }
    });
  }

  onClickAddTask = () => {
    this.setState({taskAddOpen: true});
  }

  onAddTaskDialogExit = (tasksToAdd) => {
    this.setState({taskAddOpen: false});

    let currentTasks = [];
    Array.prototype.push.apply(currentTasks, this.state.tasks);
    Array.prototype.push.apply(currentTasks, tasksToAdd);

    currentTasks.forEach(task => {
      console.log(`${task.name}, `);
    });
  
    this.updateTasksState(currentTasks);

    // tasksToAdd.forEach(task => {
    //   TimesheetRequests.addTaskMinutes(0, task.id, this.state.weekDates[0]);
    // });
  }

  render() {
    const { classes } = this.props;
    const { tasks } = this.state;

    const weekSelector = () => {
      return (
        <Grid container>
          <Grid item xs={5} />
          <Grid item xs={3}>
            <Paper className={classes.paper2} elevation={0} square>
              <Typography> Relative Date </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper} elevation={0} square>
              <DatePicker clearIcon={null} onChange={this.onCalendarChange} value={this.state.selectedDate} />
            </Paper>
          </Grid>
        </Grid>
      );
    }

    const weeklyHeader = () => {

      const headerDayColumn = (date, index) => {
        let labels = WeekUtility.getDayLabels();
        let dayLabel = labels[WeekUtility.getDay(date)];
        let dateLabel = date.getDate();
        return (
          <Grid item xs={1} key={index}>
            <Paper className={classes.paperHeader} elevation={0} square>
              <Typography>{dayLabel} {dateLabel}</Typography>
            </Paper>
          </Grid>
        );
      }

      const headerTaskColumn = () => {
        return (
          <Grid item xs={5}>
            <Paper className={classes.paperHeader} elevation={0} square>
              <Typography>Subscribed Tasks</Typography>
            </Paper>
          </Grid>
        )
      }

      return (
        <Paper className={classes.paperHeaderBg} elevation={0} square>
          <Grid container>
            {headerTaskColumn()}
            {
              this.state.weekDates.map((date, index) => {
                return headerDayColumn(date, index)
              })
            }
          </Grid>
        </Paper>
      );
    }

    const taskNameCell = (task) => {
      return (
        <Paper className={classes.paper} elevation={0} square>
          <Link 
            to={`/task/${task.id}`}
          >
            {task.name}
          </Link>
        </Paper>
      );
    }

    const timeInputCell = (id) => {
      return (
        <TimeInput id={id} onTimeChange={this.onTimeCellChange} minutesValue={this.state.taskMinutes[id]} />
      );
    }

    const taskRow = (task, row) => {

      return (
        <div key={row}>
          <Grid container>
            <Grid item xs={5}>
              <Paper className={classes.paperRow} elevation={0} square>
                {taskNameCell(task)}
              </Paper>
            </Grid>
            {
              [0, 1, 2, 3, 4, 5, 6].map((col, index) => {
                return (
                  <Grid item xs={1} key={index}>
                    <Paper className={classes.paperRow} elevation={0} square>
                      {
                        timeInputCell(`${((row*7) + (col))}`) 
                      }
                    </Paper>
                  </Grid>
                )
              })
            }
          </Grid>
          <Divider />
        </div>
      );
    }

    const taskRows = () => {
      return (
        <div>
          {
            tasks.map((task, index) => {
              return taskRow(task, index)
            })
          }
        </div>
      );
    }

    return (
      <div className={classes.root}>
        {weekSelector()}
        {weeklyHeader()}
        <Divider />
        <div style={{height: '42vh', overflow: 'auto'}} >
        {taskRows()}
        </div>
        <Divider />
        <WeekToolbar saving={this.state.saving} onClickSave={this.onClickSave} onClickAddTask={this.onClickAddTask}  />
        <AddTaskDialog open={this.state.taskAddOpen} onDialogExit={this.onAddTaskDialogExit} taskOptions={this.state.taskOthers}/>
      </div>
    );
  }

}

WeeklyContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(WeeklyContainer);
