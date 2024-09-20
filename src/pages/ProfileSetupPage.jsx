import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProfileSetup() {
    const [categories, setCategories] = useState([]);
    const [disruptions, setDisruptions] = useState({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [newSupplier, setNewSupplier] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newTopic, setNewTopic] = useState('');
    const [otherTopic, setOtherTopic] = useState('');
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
    const [selectedLocationIds, setSelectedLocationIds] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState([]);
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showTopicDropdown, setShowTopicDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const supplierDropdownRef = useRef(null);
    const locationDropdownRef = useRef(null);
    const topicDropdownRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
        fetchSuppliers();
        fetchLocations();
    }, []);

    console.log(locations)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                supplierDropdownRef.current &&
                !supplierDropdownRef.current.contains(event.target) &&
                !event.target.closest('.dropdown-button')
            ) {
                setShowSupplierDropdown(false);
            }
            if (
                locationDropdownRef.current &&
                !locationDropdownRef.current.contains(event.target) &&
                !event.target.closest('.dropdown-button')
            ) {
                setShowLocationDropdown(false);
            }
            if (
                topicDropdownRef.current &&
                !topicDropdownRef.current.contains(event.target) &&
                !event.target.closest('.dropdown-button')
            ) {
                setShowTopicDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCategories = async () => {
        try {
            const categoryResponse = await axios.get("http://18.141.34.124:7043/api/CategoryKeywords");
            const categories = categoryResponse.data.$values;
            setCategories(categories);
            const initialDisruptions = {};
            categories.forEach(category => {
                initialDisruptions[category.id] = false;
            });
            setDisruptions(initialDisruptions);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const supplierResponse = await axios.get("http://18.141.34.124:7043/api/suppliers");
            const suppliers = supplierResponse.data.$values;
            setSuppliers(suppliers);
            setFilteredSuppliers(suppliers);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const locationsResponse = await axios.get("http://18.141.34.124:7043/api/cities/top1000");
            const locations = locationsResponse.data.$values;
            setLocations(locations);
            setFilteredLocations(locations);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const handleCheckboxChange = (event, id, type) => {
        const { checked } = event.target;

        if (type === 'disruption') {
            setDisruptions(prevState => ({
                ...prevState,
                [id]: checked
            }));

            if (id === 'Others') {
                setShowOtherInput(checked);
                if (!checked) {
                    setOtherTopic('');
                }
            }
        } else if (type === 'supplier') {
            setSelectedSupplierIds(prevSelected => {
                if (checked) {
                    return [...prevSelected, id];
                } else {
                    return prevSelected.filter(selectedId => selectedId !== id);
                }
            });
        } else if (type === 'location') {
            setSelectedLocationIds(prevSelected => {
                if (checked) {
                    return [...prevSelected, id];
                } else {
                    return prevSelected.filter(selectedId => selectedId !== id);
                }
            });
        }
    };

    const handleAddSupplier = () => {
        if (newSupplier.trim() === '') {
            alert('Please enter a supplier name.');
            return;
        }
        const newSupplierObj = { id: Date.now(), bP_Name: newSupplier };
        setSuppliers(prevSuppliers => [...prevSuppliers, newSupplierObj]);
        setFilteredSuppliers(prevSuppliers => [...prevSuppliers, newSupplierObj]);
        setNewSupplier('');
    };

    const handleAddLocation = () => {
        if (newLocation.trim() === '') {
            alert('Please enter a location name.');
            return;
        }
        const newLocationObj = { id: Date.now(), city: newLocation };
        setLocations(prevLocations => [...prevLocations, newLocationObj]);
        setFilteredLocations(prevLocations => [...prevLocations, newLocationObj]);
        setNewLocation('');
    };

    const handleAddTopic = () => {
        if (newTopic.trim() === '') {
            alert('Please enter a topic name.');
            return;
        }
        const newTopicObj = { id: Date.now(), city: newTopic };
        setNewTopic(prevLocations => [...prevLocations, newTopicObj]);
        setFilteredTopics(prevLocations => [...prevLocations, newTopicObj]);
        setNewTopic('');
    };

    const handleDropdownToggle = (type) => {
        if (type === 'supplier') {
            setShowSupplierDropdown(prev => !prev);
            setSearchQuery('');
            setFilteredSuppliers(suppliers);
        } else if (type === 'location') {
            setShowLocationDropdown(prev => !prev);
            setSearchQuery('');
            setFilteredLocations(locations);
        } else if (type === 'topic') {
            setShowTopicDropdown(prev => !prev);
            setSearchQuery('');
            setFilteredTopics(categories);
        }
    };

    const handleSearch = (type, event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        if (type === 'supplier') {
            setFilteredSuppliers(suppliers.filter(supplier =>
                supplier.bP_Name.toLowerCase().includes(query)
            ));
        } else if (type === 'location') {
            setFilteredLocations(locations.filter(location =>
                location.city.toLowerCase().includes(query)
            ));
        } else if (type === 'topic') {
            setFilteredTopics(categories.filter(category =>
                category.category.toLowerCase().includes(query)
            ));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (name.trim() === '' || email.trim() === '') {
            alert('Name and Email are mandatory fields.');
            return;
        }

        // Gather selected category IDs
        let selectedCategoryIds = Object.keys(disruptions)
            .filter(key => disruptions[key])
            .map(key => categories.find(category => category.id.toString() === key)?.id)
            .filter(Boolean);

        // Handle "Others" category
        if (disruptions['Others'] && otherTopic.trim() !== '') {
            try {
                const response = await axios.post("http://18.141.34.124:7043/api/CategoryKeywords", {
                    category: otherTopic,
                    keyword: otherTopic
                });
                const newCategory = response.data;
                selectedCategoryIds.push(newCategory.id);
            } catch (error) {
                console.error('Error posting category:', error);
                alert('There was an error adding the new category. Please try again.');
                return;
            }
        }

        // Prepare profile data
        const profileData = {
            profile: {
                name,
                email,
                isDeleted: false,
                categoryKeywords: []
            },
            categoryKeywordIds: selectedCategoryIds,
            supplierIds: selectedSupplierIds,
            locationIds: selectedLocationIds
        };

        // Submit profile data
        try {
            const response = await axios.post("http://18.141.34.124:7043/api/UserProfiles", profileData);
            alert('Profile submitted successfully!');

            // Navigate to homepage with user's name
            navigate('/homepage', { state: { userName: name } });
        } catch (error) {
            console.error('Error submitting profile:', error);
            alert('There was an error submitting the profile. Please try again.');
        }
    };

    // Get names based on selected IDs
    const selectedSupplierNames = selectedSupplierIds.map(id => {
        const supplier = suppliers.find(supplier => supplier.id === id);
        return supplier ? supplier.bP_Name : '';
    }).filter(name => name);

    const selectedLocationNames = selectedLocationIds.map(id => {
        const location = locations.find(location => location.id === id);
        return location ? location.location : '';
    }).filter(name => name);

    const selectedTopicIds = Object.keys(disruptions).filter(id => disruptions[id]);
    const selectedTopicNames = selectedTopicIds.map(id => {
        const category = categories.find(category => category.id.toString() === id);
        return category ? category.category : '';
    }).filter(Boolean);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Profile Setup</h2>

            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <button
                        type="button"
                        onClick={() => handleDropdownToggle('supplier')}
                        className="dropdown-button"
                        style={styles.dropdownButton}
                    >
                        Suppliers
                    </button>
                    <div>
                        <input
                            type="text"
                            value={newSupplier}
                            onChange={(e) => setNewSupplier(e.target.value)}
                            placeholder="Add new supplier"
                            style={styles.newInput}
                        />
                        <button type="button" onClick={handleAddSupplier} style={styles.addButton}>
                            Add
                        </button>
                    </div>
                    {showSupplierDropdown && (
                        <div ref={supplierDropdownRef} style={styles.dropdown}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch('supplier', e)}
                                placeholder="Search suppliers"
                                style={styles.searchInput}
                            />
                            <ul style={styles.dropdownList}>
                                {filteredSuppliers.map(supplier => (
                                    <li key={supplier.id} style={styles.dropdownItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSupplierIds.includes(supplier.id)}
                                            onChange={(e) => handleCheckboxChange(e, supplier.id, 'supplier')}
                                        />
                                        {supplier.bP_Name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                    <div style={styles.selectedItems}>
                        <h3>Selected Suppliers : </h3>
                        {selectedSupplierNames.length > 0 && (
                            <div style={styles.selectedItemsContainer}>
                                {selectedSupplierNames.map(name => (
                                    <div key={name} style={styles.selectedSupplier}>{name}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                <div style={styles.formGroup}>
                    <button
                        type="button"
                        onClick={() => handleDropdownToggle('location')}
                        className="dropdown-button"
                        style={styles.dropdownButton}
                    >
                        Locations
                    </button>
                    <div>
                        <input
                            type="text"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            placeholder="Add new location"
                            style={styles.newInput}
                        />
                        <button type="button" onClick={handleAddLocation} style={styles.addButton}>
                            Add
                        </button>
                    </div>
                    {showLocationDropdown && (
                        <div ref={locationDropdownRef} style={styles.dropdown}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch('location', e)}
                                placeholder="Search locations"
                                style={styles.searchInput}
                            />
                            <ul style={styles.dropdownList}>
                                {filteredLocations.map(location => (
                                    <li key={location.id} style={styles.dropdownItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedLocationIds.includes(location.id)}
                                            onChange={(e) => handleCheckboxChange(e, location.id, 'location')}
                                        />
                                        {location.location}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={styles.selectedItems}>
                        <h3>Selected Locations : </h3>
                        {selectedLocationNames.length > 0 && (
                            <div style={styles.selectedItemsContainer}>
                                {selectedLocationNames.map(name => (
                                    <div key={name} style={styles.selectedLocation}>{name}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <button
                        type="button"
                        onClick={() => handleDropdownToggle('topic')}
                        className="dropdown-button"
                        style={styles.dropdownButton}
                    >
                        Disruptions
                    </button>
                    <div>
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Add new topic"
                            style={styles.newInput}
                        />
                        <button type="button" onClick={handleAddTopic} style={styles.addButton}>
                            Add
                        </button>
                    </div>
                    {showTopicDropdown && (
                        <div ref={topicDropdownRef} style={styles.dropdown}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch('topic', e)}
                                placeholder="Search disruptions"
                                style={styles.searchInput}
                            />
                            <ul style={styles.dropdownList}>
                                {filteredTopics.map(topic => (
                                    <li key={topic.id} style={styles.dropdownItem}>
                                        <input
                                            type="checkbox"
                                            checked={disruptions[topic.id]}
                                            onChange={(e) => handleCheckboxChange(e, topic.id, 'disruption')}
                                        />
                                        {topic.category}
                                    </li>
                                ))}
                                {showOtherInput && (
                                    <li>
                                        <input
                                            type="text"
                                            value={otherTopic}
                                            onChange={(e) => setOtherTopic(e.target.value)}
                                            placeholder="Other category"
                                            style={styles.newInput}
                                        />
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}


                    <div style={styles.selectedItems}>
                        <h3>Selected Disruptions : </h3>
                        {selectedTopicNames.length > 0 && (
                            <div style={styles.selectedItemsContainer}>
                                {selectedTopicNames.map(name => (
                                    <div key={name} style={styles.selectedTopic}>{name}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>





                <button type="submit" style={styles.submitButton}>Submit</button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        color: 'black'
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    },
    dropdownButton: {
        padding: '10px 20px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        background: '#f8f8f8',
        cursor: 'pointer',
        color: 'black'
    },
    dropdown: {
        position: 'absolute',
        background: '#fff',
        border: '1px solid #000000',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
    },
    searchInput: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginBottom: '10px'
    },
    dropdownList: {
        listStyle: 'none',
        padding: '0',
        margin: '0'
    },
    dropdownItem: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
    },
    newInput: {
        width: 'calc(100% - 300px)',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ddd',
         color: 'black'
    },
    selectedItems: {
        marginTop: '20px'
    },
    selectedItemsContainer: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    selectedSupplier: {
        padding: '10px',
        margin: '5px',
        background: '#e0e0e0',
        borderRadius: '16px'
    },
    selectedLocation: {
        padding: '10px',
        margin: '5px',
        background: '#d1f714',
        borderRadius: '16px',
    },
    selectedTopic: {
        padding: '10px',
        margin: '5px',
        background: '#44fff6',
        borderRadius: '16px'
    },
    submitButton: {
        padding: '10px 20px',
        marginTop: '50px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '4px',
        background: '#007bff',
        color: '#fff',
        cursor: 'pointer'
    },
    addButton: {
        marginLeft: '30px',
        width: '10%',
        height: '5vh',
        background: '#c0ff78',
         color: 'black'
    }
};

export default ProfileSetup;
