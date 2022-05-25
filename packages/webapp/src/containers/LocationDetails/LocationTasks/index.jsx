import React, { useMemo } from 'react';
import {
  manualFilteredTaskCardContentSelector,
  taskCardContentSelector,
  getTaskStatus,
} from '../../Task/taskCardContentSelector';
import { isAdminSelector, userFarmSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import {
  cropLocationByIdSelector,
  locationByIdSelector,
  locationsSelector,
} from '../../locationSlice';
import PureLocationTasks from '../../../components/LocationTasks';

export default function LocationTasks({ history, match, location: { pathname } }) {
  const isAdmin = useSelector(isAdminSelector);
  const { user_id, farm_id } = useSelector(userFarmSelector);
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id));

  const areCropEnabled = ['field', 'garden', 'greenhouse', 'buffer_zone'];

  const hasCrops = areCropEnabled.includes(pathname.split('/')[1]);

  const filter = (taskList) => {
    const activeStatus = ['planned', 'late'];
    return taskList.filter(
      (t) =>
        t.locations.find((loc) => loc.location_id === location_id) &&
        activeStatus.includes(getTaskStatus(t)),
    );
  };

  const locationTasks = useSelector(manualFilteredTaskCardContentSelector(filter));

  const { tasks, count } = useMemo(() => {
    return locationTasks.reduce(
      (previous, current) => {
        previous.count++;
        if (!Object.keys(previous.tasks).includes(current.date)) {
          previous.tasks[current.date] = [current];
          console.log('updated previous');
          console.log(previous);
        } else {
          previous.tasks[current.date].push(current);
        }
        return previous;
      },
      { count: 0, tasks: {} },
    );
  }, [locationTasks]);

  return (
    <>
      <PureLocationTasks
        history={history}
        match={match}
        location={location}
        isAdmin={isAdmin}
        tasks={tasks}
        count={count}
        hasCrops={hasCrops}
      />
    </>
  );
}