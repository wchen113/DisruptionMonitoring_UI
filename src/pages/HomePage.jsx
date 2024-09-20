import React, { useState } from 'react';
import CitySearchAndSupplier from '../components/CitySearch';
import DisruptionMonitoring from '../components/DisruptionMonitoring';


const HomePage = () => {
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    return (
        <div>
            {/* <CitySearchAndSupplier
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
            /> */}
            <DisruptionMonitoring fromDate={fromDate} toDate={toDate} />
        </div>
    );
};

export default HomePage;
