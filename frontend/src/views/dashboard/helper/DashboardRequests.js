
import { GET_LIST, CREATE } from 'react-admin';
import { TASK_STATUS } from '../../../_utilities/constants';
import restClient from '../../../_utilities/dataProvider';

class DashboardRequests {

  static getTasksForThisWeek(resolve) {
    let username = localStorage.getItem('username');

    restClient()
      .then(dataProvider => {
        dataProvider(GET_LIST, 'task', {
            filter: {
              status_like: `${TASK_STATUS.OPEN}|${TASK_STATUS.ONGOING}`,
              subscriber_like: `${username}`,
            }
        })
      .then(response => {
        if(resolve) {
          resolve(response.data);
        }
      });
    });
  }

}

export default DashboardRequests;
