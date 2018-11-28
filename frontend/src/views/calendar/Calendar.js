
import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import events from './events';
import 'react-big-calendar/lib/css/react-big-calendar.css';

let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])
const localizer = BigCalendar.momentLocalizer(moment);

class Calendar extends React.Component {
  render () {
    return (
      <Card>
        <CardHeader title="Calendar" />
        <CardContent style={{height: '70vh'}}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
          />
        </CardContent>
      </Card>
    );
  }
}

export default Calendar;
