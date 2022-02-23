import React, { useEffect, useRef, useState } from 'react';
import { getMassUnit, roundToTwoDecimal } from '../../../util';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import { Semibold } from '../../Typography';
import { useTranslation } from 'react-i18next';

function PriceCropContainer({
  currencySymbol,
  name,
  pricePoints,
  config: {
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640,
    height = 400,
  } = {},
}) {
  const [state, setState] = useState({
    max: 0,
    ownPriceSeries: {},
    networkPriceSeries: {},
  });

  const {
    units: { measurement },
  } = useSelector(userFarmSelector);

  const { t } = useTranslation();

  const formatState = () => {
    const ownPriceSeries = {};
    const networkPriceSeries = {};

    pricePoints.forEach((pricePoint, index) => {
      // Clean data: format crop_date into YY-MM-DD and round prices to two decimal places
      ownPriceSeries[[pricePoint['crop_date'] + '-01']] = roundToTwoDecimal(
        pricePoint['crop_price'] / (measurement === 'metric' ? 1 : 2.20462),
      );
      networkPriceSeries[[pricePoint['crop_date'] + '-01']] = roundToTwoDecimal(
        pricePoint['network_price'] / (measurement === 'metric' ? 1 : 2.20462),
      );
    });

    // Find max datapoint across the two datasets for styling chart
    const ownPriceDataPoints = Object.values(ownPriceSeries);
    const networkPriceDataPoints = Object.values(networkPriceSeries);
    const allDataPoints = ownPriceDataPoints.concat(networkPriceDataPoints);
    const maxDataPoint = allDataPoints.reduce((a, b) => Math.max(a, b));

    setState({
      ownPriceSeries,
      networkPriceSeries,
      max: maxDataPoint,
    });
  };

  useEffect(() => formatState(), [pricePoints]);

  const { ownPriceSeries, networkPriceSeries, max } = state;

  const yTitle = t('INSIGHTS.PRICES.Y_TITLE', {
    currency: currencySymbol,
    mass: getMassUnit(),
    interpolation: { escapeValue: false },
  });

  const svgRef = useRef();
  const xAxisRef = useRef();
  return (
    <div style={{ marginBottom: '12px' }}>
      <Semibold>{name}</Semibold>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0,0,${width},${height}`}
        style={{ maxWi: '100%' }}
        fontSize={10}
      >
        <g ref={xAxisRef} />
      </svg>

      <div>
        {/*<AreaChart*/}
        {/*  messages={{ empty: 'Not data' }}*/}
        {/*  width="95%"*/}
        {/*  height="85%"*/}
        {/*  ytitle={yTitle}*/}
        {/*  max={max}*/}
        {/*  library={{*/}
        {/*    scales: {*/}
        {/*      xAxes: [*/}
        {/*        {*/}
        {/*          type: 'time',*/}
        {/*          time: {*/}
        {/*            displayFormats: {*/}
        {/*              month: 'YYYY-MM',*/}
        {/*            },*/}
        {/*          },*/}
        {/*        },*/}
        {/*      ],*/}
        {/*    },*/}
        {/*  }}*/}
        {/*  data={[*/}
        {/*    {*/}
        {/*      name: t('INSIGHTS.PRICES.OWN_PRICE'),*/}
        {/*      data: ownPriceSeries,*/}
        {/*      dataset: {*/}
        {/*        backgroundColor: 'rgba(51, 102, 204, 0.4)',*/}
        {/*      },*/}
        {/*    },*/}
        {/*    {*/}
        {/*      name: t('INSIGHTS.PRICES.NETWORK_PRICE'),*/}
        {/*      data: networkPriceSeries,*/}
        {/*      dataset: {*/}
        {/*        backgroundColor: 'rgba(220, 57, 18, 0.4)',*/}
        {/*      },*/}
        {/*    },*/}
        {/*  ]}*/}
        {/*/>*/}
      </div>
    </div>
  );
}

export default PriceCropContainer;
