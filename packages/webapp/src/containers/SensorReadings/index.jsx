import React, { useEffect } from 'react';
// import PureRoleSelection from '../../components/RoleSelection';
import { useDispatch, useSelector } from 'react-redux';
import { patchRole } from '../AddFarm/saga';
import history from '../../history';
// import { roleToId } from './roleMap';
import { useTranslation } from 'react-i18next';
// import { userFarmSelector } from '../userFarmSlice';
import { getSensorsTempratureReadings } from './saga';
import ReadingsLineChart from '../../components/ReadingsLineChart';
import { bulkSensorsReadingsSliceSelector } from '../../containers/bulkSensorReadingsSlice';
import { colors } from './constants';
import { findCenter } from './utils';
import { useState } from 'react';

function SensorReadings({
  sensorsList = [
    {
      sensor_name: 'aa',
      lat: 49.24260553263377,
      lon: -123.10153961830565,
    },
  ],
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [sensorsInfoList, setSensorsInfoList] = useState(sensorsList);

  const addAmbientTemperatureInfo = () => {
    const centerLatAndLong = findCenter(sensorsInfoList.map((s) => ({ lat: s.lat, lng: s.lon })));
    sensorsInfoList.push({
      sensor_name: 'Ambient temperature',
      lat: centerLatAndLong.lat,
      lon: centerLatAndLong.lng,
    });
    setSensorsInfoList(sensorsInfoList);
  };

  useEffect(() => {
    addAmbientTemperatureInfo();
    dispatch(getSensorsTempratureReadings(sensorsList));
  }, []);

  const bulkSensorsReadingsSliceSelectorData = useSelector(bulkSensorsReadingsSliceSelector);
  console.log('bulkSensorsReadingsSliceSelectorData', bulkSensorsReadingsSliceSelectorData);
  return (
    <>
      {bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature?.length && (
        <ReadingsLineChart
          yAxisDataKeys={sensorsInfoList.map((s) => s.sensor_name)}
          chartData={bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature}
          xAxisDataKey="current_date_time"
          lineColors={colors}
          xAxisLabel="Time"
          yAxisLabel="Temperature"
        />
      )}
    </>
    // <PureRoleSelection
    //   onSubmit={onSubmit}
    //   onGoBack={onGoBack}
    //   title={t('ROLE_SELECTION.TITLE')}
    //   defaultRole={role}
    //   defaultOwnerOperated={owner_operated}
    // />
  );
}

export default SensorReadings;