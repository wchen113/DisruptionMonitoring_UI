import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './DisruptionMonitoring.css';
import MapComponent from './MapComponents';
import Greeting from './Greeting';

const API_BASE_URL = "http://18.141.34.124:7043/api";

const DisruptionMonitoring = () => {
    const [cities, setCities] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null); // Selected article state
    const [displayCount, setDisplayCount] = useState(5);
    const [userName, setUserName] = useState('User');
    const [categoryKeywords, setCategoryKeywords] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState({ cities: false, suppliers: false, articles: false });
    const [mapCenter, setMapCenter] = useState([0, 0]);
    const [mapZoom, setMapZoom] = useState(2);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const fromDate = queryParams.get('fromDate');
    const toDate = queryParams.get('toDate');
    const lat = queryParams.get('lat');
    const lng = queryParams.get('lng');
    const selectedCities = queryParams.get('cities') ? queryParams.get('cities').split(',') : [];
    const selectedSuppliers = queryParams.get('suppliers') ? queryParams.get('suppliers').split(',') : [];
    const disruptionType = queryParams.get('disruptiontype');

    const navigate = useNavigate();
    const ARTICLE_COUNT_OPTIONS = [5, 10, 15, 20, 25, 30];

    useEffect(() => {
        if (email) {
            fetchUserProfile(email);
        }
    }, [email]);

    useEffect(() => {
        if (categoryKeywords.length > 0) {
            fetchArticles();
        }
    }, [categoryKeywords]);

    useEffect(() => {
        if (lat && lng) {
            setMapCenter([parseFloat(lat), parseFloat(lng)]);
            setMapZoom(7);
        }
    }, [lat, lng]);

    const fetchArticles = async () => {
        setLoading(prev => ({ ...prev, articles: true }));
        try {
            const response = await axios.get(`${API_BASE_URL}/articles`);
            const fetchedArticles = response.data.$values
                .filter(article => article.publishedDate)
                .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));

            const filteredArticles = fetchedArticles.filter(article => {
                const publishedDate = new Date(article.publishedDate);
                return (
                    (!fromDate || publishedDate >= new Date(fromDate)) &&
                    (!toDate || publishedDate <= new Date(toDate)) &&
                    (!selectedCities.length || selectedCities.includes(article.city)) &&
                    (!selectedSuppliers.length || selectedSuppliers.includes(article.supplier))
                );
            });

            setArticles(filteredArticles);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setError('Failed to load articles. Please try again later.');
        } finally {
            setLoading(prev => ({ ...prev, articles: false }));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(prev => ({ ...prev, cities: true, suppliers: true }));
            try {
                const [citiesResponse, suppliersResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/cities`),
                    axios.get(`${API_BASE_URL}/suppliers`)
                ]);
                setCities(citiesResponse.data.$values || []);
                setSuppliers(suppliersResponse.data.$values || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(prev => ({ ...prev, cities: false, suppliers: false }));
            }
        };

        fetchData();
    }, []);

    const fetchUserProfile = async (email) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/UserProfiles/GetProfileByEmail`, {
                params: { email }
            });
            const profile = response.data;
            if (profile?.id) {
                const profileById = await axios.get(`${API_BASE_URL}/userprofiles/${profile.id}`);
                const userProfile = profileById.data;
                if (userProfile) {
                    setUserName(userProfile.name || 'User');
                    setCategoryKeywords(userProfile.categoryKeywords.$values || []);
                } else {
                    throw new Error('Failed to load user profile.');
                }
            } else {
                throw new Error('Failed to load user profile.');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError(error.message);
        }
    };

    const isArticleRelevant = useCallback((article) => {
        const relevantCategoryNames = categoryKeywords.map(keyword => keyword.categoryName);
        return relevantCategoryNames.includes(article.disruptionType);
    }, [categoryKeywords]);

    const haversineDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth's radius in kilometers
        const toRadians = (degrees) => degrees * (Math.PI / 180);

        const dLat = toRadians(lat2 - lat1);
        const dLng = toRadians(lng2 - lng1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    };

    const filteredArticleList = useMemo(() => {
        const relevantArticles = articles.filter(article => isArticleRelevant(article));

        const disruptionTypeFilteredArticles = disruptionType
            ? relevantArticles.filter(article => article.disruptionType === disruptionType)
            : relevantArticles;

        const geoFilteredArticles = lat && lng
            ? disruptionTypeFilteredArticles.filter(article => {
                const articleLat = article.lat;
                const articleLng = article.lng;
                const distance = haversineDistance(parseFloat(lat), parseFloat(lng), articleLat, articleLng);
                return distance <= 300;
            })
            : disruptionTypeFilteredArticles;

        return geoFilteredArticles.slice(0, displayCount);
    }, [articles, displayCount, isArticleRelevant, disruptionType, lat, lng]);

    const toggleArticleDetails = (article) => {
        console.log("Article clicked:", article);
        setSelectedArticle(prevArticle => prevArticle?.id === article.id ? null : article); // Toggle selection
    };

    const handleDisplayCountChange = (event) => {
        setDisplayCount(Number(event.target.value));
    };

    const handleDetailsClick = (event) => {
        event.stopPropagation();
    };

    const handleSearchCriteria = () => {
        navigate(`/city-search?email=${encodeURIComponent(email)}`);
    };

    return (
        <div id="articles-section">
            <Greeting userName={userName} />
            <h2>🚨 Latest News 🚨</h2>
            {error && <p className="error-message">{error}</p>}
            {loading.articles ? (
                <p>Loading articles...</p>
            ) : (
                <>
                    <div id="count-select-container">
                        <label htmlFor="count-select">Number of Articles:</label>
                        <select
                            id="count-select"
                            value={displayCount}
                            onChange={handleDisplayCountChange}
                        >
                            {ARTICLE_COUNT_OPTIONS.map(count => (
                                <option key={count} value={count}>
                                    {count}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button onClick={handleSearchCriteria}>Search Criteria</button>

                    <MapComponent
                        zoom={mapZoom}
                        center={mapCenter}
                        markers={[
                            ...filteredArticleList.map(article => ({
                                lat: article.lat,
                                lng: article.lng,
                                title: article.title,
                                details: `Severity: ${article.severity} Date: ${article.publishedDate}`,
                                type: 'article'
                            })),
                            ...suppliers.map(supplier => ({
                                lat: supplier.lat,
                                lng: supplier.lng,
                                title: supplier.bP_Name,
                                details: `Address: ${supplier.address_1} Contact: ${supplier.telephone}`,
                                type: 'supplier'
                            })),
                            ...cities.map(city => ({
                                lat: city.latitude,
                                lng: city.longitude,
                                title: city.cityName,
                                details: `City Name: ${city.cityName} Population: ${city.population}`,
                                type: 'city'
                            }))
                        ]}
                        onMarkerClick={toggleArticleDetails}
                    />

                        <div id="articles-list">
                            {filteredArticleList.map((article) => (
                                <div key={article.id}>
                                    {/* Render each article */}
                                    <div
                                        className={`article-item ${selectedArticle?.id === article.id ? 'active' : ''}`}
                                        onClick={() => toggleArticleDetails(article)}
                                    >
                                        <h3>{article.title}</h3>
                                        <p>Click to see details</p>
                                    </div>

                                    {/* Conditionally render article details below the selected article */}
                                    {selectedArticle?.id === article.id && (
                                        <div className="article-details">
                                            <h3>{selectedArticle.title}</h3>
                                            <img src={selectedArticle.imageUrl} alt={selectedArticle.title} style={{ maxWidth: '100%' }} />
                                            <p>{selectedArticle.text || "No content available"}</p>

                                            {/* Additional Information */}
                                            <p><strong>Severity:</strong> {selectedArticle.severity}</p>
                                            <p><strong>Published Date:</strong> {selectedArticle.publishedDate}</p>
                                            <p><strong>Location:</strong> {selectedArticle.location}</p>
                                            <p><strong>Disruption Type:</strong> {selectedArticle.disruptionType}</p>

                                            {/* Source Info */}
                                            <p><strong>Source:</strong>
                                                <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer">
                                                    {selectedArticle.sourceName}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        
                </>
            )}
        </div>
    );
};

export default DisruptionMonitoring;
