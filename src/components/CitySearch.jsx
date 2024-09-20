import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import './CitySearchAndSupplier.css';

const CitySearchAndSupplier = ({ onCitySelect }) => {
    const [cities, setCities] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [disruptionTypes, setDisruptionTypes] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedDisruptionType, setSelectedDisruptionType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedContinent, setSelectedContinent] = useState('');
    const [continents, setContinents] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const fetchData = useCallback(async () => {
        try {
            const [citiesResponse, suppliersResponse, disruptionTypeResponse] = await Promise.all([
                axios.get("http://18.141.34.124:7043/api/cities"),
                axios.get("http://18.141.34.124:7043/api/suppliers"),
                axios.get("http://18.141.34.124:7043/api/categorykeywords")
            ]);

            const citiesData = citiesResponse.data.$values || [];
            const suppliersData = suppliersResponse.data.$values || [];
            const disruptionTypesData = disruptionTypeResponse.data.$values || [];

            setCities(citiesData);
            setSuppliers(suppliersData);
            setDisruptionTypes(disruptionTypesData);
            setContinents([...new Set(citiesData.map(city => city.continent))]);

        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredCities = useMemo(() => {
        return cities.filter(city =>
            city.location.toLowerCase().includes(selectedCity?.location?.toLowerCase() || '') &&
            (selectedContinent === '' || city.continent === selectedContinent)
        );
    }, [cities, selectedCity, selectedContinent]);

    const handleContinentChange = (event) => {
        const continent = event.target.value;
        setSelectedContinent(continent);
        setSelectedCity(null);
    };

    const handleCitySelect = (event) => {
        const cityId = event.target.value;
        const city = filteredCities.find(city => String(city.id) === cityId);
        setSelectedCity(city);
        if (onCitySelect) onCitySelect(city);
    };

    const handleSupplierSelect = (event) => {
        const supplierId = event.target.value;
        const supplier = suppliers.find(supplier => String(supplier.id) === supplierId);
        setSelectedSupplier(supplier);
    };

    const handleDisruptionTypes = (event) => {
        const disruptionTypeId = event.target.value;
        const disruptionType = disruptionTypes.find(disruptionType => String(disruptionType.id) === disruptionTypeId);
        setSelectedDisruptionType(disruptionType);
    };

    const handleFilter = () => {
        if (!email) {
            alert("Email is missing!");
            return;
        }

        if (fromDate && toDate && fromDate > toDate) {
            alert("From date cannot be after To date!");
            return;
        }

        let url = `/homepage?email=${encodeURIComponent(email)}`;

        if (selectedCity) {
            const { latitude, longitude } = selectedCity;
            url += `&lat=${latitude}&lng=${longitude}`;
        }

        if (selectedSupplier) {
            const { lat, lng } = selectedSupplier;
            url += `&lat=${lat}&lng=${lng}`;
        }

        if (selectedDisruptionType) {
            url += `&disruptiontype=${selectedDisruptionType.category}`;
        }

        if (fromDate && toDate) {
            url += `&fromDate=${formatDate(fromDate)}&toDate=${formatDate(toDate)}`;
        }

        if (!selectedCity && !selectedSupplier && !(fromDate && toDate) && !selectedDisruptionType) {
            alert("Please select a valid city, supplier, or date range!");
            return;
        }

        navigate(url);
    };

    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="container">
            {error && <div className="error-message" aria-live="assertive">{error}</div>}
            {loading && <div className="loading-message" aria-live="polite">Loading data...</div>}
            {!loading && (
                <>
                    <h2>Select a city</h2>
                    <div className="selection-row">
                        <select id="continent" onChange={handleContinentChange} value={selectedContinent}>
                            <option value="">All Continents</option>
                            {continents.map(continent => (
                                <option key={continent} value={continent}>
                                    {continent}
                                </option>
                            ))}
                        </select>
                        <select id="city" onChange={handleCitySelect} value={selectedCity?.id || ''}>
                            <option value="">Select a city</option>
                            {filteredCities.map(city => (
                                <option key={city.id} value={city.id}>{city.location}</option>
                            ))}
                        </select>
                    </div>

                    <h2>Select a Supplier</h2>
                    <div className="selection-row">
                        <select id="supplier" onChange={handleSupplierSelect} value={selectedSupplier?.id || ''}>
                            <option value="">Select a supplier</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>{supplier.bP_Name}</option>
                            ))}
                        </select>
                    </div>

                    <h2>Select Disruption Type</h2>
                    <div className="selection-row">
                        <select id="disruptiontypes" onChange={handleDisruptionTypes} value={selectedDisruptionType?.id || ''}>
                            <option value="">Select Disruption Type</option>
                            {disruptionTypes.map(disruptionType => (
                                <option key={disruptionType.id} value={disruptionType.id}>{disruptionType.category}</option>
                            ))}
                        </select>
                    </div>

                    <h2>Select date range</h2>
                    <div className="date-range">
                        <label htmlFor="fromDate" className="calendar-label">From:</label>
                        <Calendar onChange={setFromDate} value={fromDate} aria-label="From Date" />
                        <label htmlFor="toDate" className="calendar-label">To:</label>
                        <Calendar onChange={setToDate} value={toDate} aria-label="To Date" />
                    </div>

                    <button
                        onClick={handleFilter}
                        className={`submit-button ${(!selectedCity && !selectedSupplier && !(fromDate && toDate)) && !selectedDisruptionType || loading ? 'disabled' : ''}`}
                        disabled={(!selectedCity && !selectedSupplier && !(fromDate && toDate)) && !selectedDisruptionType || loading}
                    >
                        Apply Filter
                    </button>
                </>
            )}
        </div>
    );
};

export default CitySearchAndSupplier;
