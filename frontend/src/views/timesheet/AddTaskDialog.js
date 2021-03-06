import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';

class FormDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: [],
    }
  
  }

  componentDidMount() {

  }

  handleCancel = () => {
    this.props.onDialogExit([]);
  }

  updateCheckedState = (checked) => {
    this.setState({checked});
  }

  handleSubmit = () => {
    let selectedTasks = [];
    let checkedIndex = this.state.checked;
    let allTasks;

    for(let i = 0; i < this.state.checked.length; i++) {
      selectedTasks.push(this.state.checked[i]);
    }

    this.updateCheckedState([]);
    this.props.onDialogExit(selectedTasks);
  }

  handleToggle = value => () => {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.updateCheckedState(newChecked);
  }

  render() {
    const {taskOptions} = this.props;
    const {classes} = this.props;

    return (
      <Dialog
        open={this.props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add Tasks</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Search name of task you want to add in this week's timesheet
          </DialogContentText>
          <List>
            {
              taskOptions.map((task, index) => {
                return (
                  <ListItem
                    key={index}
                    button
                    dense
                    onClick={this.handleToggle(task)}
                  >
                    <Checkbox
                      checked={this.state.checked.indexOf(task) !== -1}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText 
                      primary={`${task.name}`}
                      secondary={`${task.projectScope}`}
                    />
                  </ListItem>
                )
              })
            }
          </List>

        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default FormDialog;