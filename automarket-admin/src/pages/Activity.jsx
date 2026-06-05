import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivities } from '../utils/api';

const Activity = () => {
  const navigate = useNavigate();
  const [activitiesData, setActivitiesData] = useState({});
  const [userFilter, setUserFilter] = useState('');
  const [regFilter, setRegFilter] = useState('');
  const [activityType, setActivityType] = useState('web'); // 'web', 'mail', 'newsletter', or 'weekly-report-clicked'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedCards, setCollapsedCards] = useState(new Set());
  const [collapsedUserGroups, setCollapsedUserGroups] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedListing, setSelectedListing] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getActivities();
        console.log(response);
        setActivitiesData(response || {});
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('Failed to load activities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'web click':
        return '🖱️';
      case 'email opened':
        return '📧';
      case 'weekly report email opened':
        return '📊';
      case 'car clicked from newsletter':
        return '📰';
      case 'weekly report clicked':
        return '📊';
      case 'wishlist opened':
        return '🔖';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'web click':
        return 'text-blue-400';
      case 'email opened':
        return 'text-green-400';
      case 'weekly report email opened':
        return 'text-purple-400';
      case 'car clicked from newsletter':
        return 'text-yellow-400';
      case 'weekly report clicked':
        return 'text-indigo-400';
      case 'wishlist opened':
        return 'text-pink-400';
      default:
        return 'text-gray-400';
    }
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'user':
        return 'Website User';
      case 'newsletter':
        return 'Newsletter Subscriber';
      default:
        return userType;
    }
  };

  const getUserTypeBadgeColor = (userType) => {
    switch (userType) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'newsletter':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayActivityType = (type) => {
    switch (type) {
      case 'car clicked from newsletter':
        return 'newsletter clicked';
      default:
        return type;
    }
  };

  // Extract and filter activities based on type
  const getAllActivitiesByType = (type) => {
    const activities = [];
    const allActivities = activitiesData.activities || {};

    Object.values(allActivities).forEach((userData) => {
      userData.activities.forEach((activity) => {
        // Filter by activity type
        let activityTypeMatch = false;

        if (type === 'web') {
          activityTypeMatch = activity.type === 'web click';
        } else if (type === 'mail') {
          // Include both email opened and weekly report activities
          activityTypeMatch = activity.type === 'email opened' || activity.weeklyReportInfo;
        }

        if (activityTypeMatch) {
          activities.push({
            ...activity,
            user: userData.user,
            userType: userData.userType,
          });
        }
      });
    });
    return activities;
  };

  // Newsletter click activities (flat array)
  const getNewsletterClickActivities = () => {
    const newsletterClicks = activitiesData['newsletter-click'] || [];
    console.log(newsletterClicks.filter((activity) => activity.user_id == 235));
    // Map newsletterContact to user for consistency
    return newsletterClicks.map((activity) => ({
      ...activity,
      user: activity.newsletterContact || { name: 'Unknown User', email: 'unknown' },
      userType: 'newsletter',
    }));
  };

  // Weekly report clicked activities - only show activities with listings
  const getWeeklyReportClickedActivities = () => {
    const activities = [];
    const allActivities = activitiesData.activities || {};

    Object.values(allActivities).forEach((userData) => {
      userData.activities.forEach((activity) => {
        // Only include weekly report clicked activities that have a listing
        if (activity.type === 'weekly report clicked' && activity.listing) {
          activities.push({
            ...activity,
            user: userData.user,
            userType: userData.userType,
          });
        }
      });
    });
    return activities;
  };

  // Wishlist opened activities - show activities without listings
  const getWishlistOpenedActivities = () => {
    const activities = [];
    const allActivities = activitiesData.activities || {};

    Object.values(allActivities).forEach((userData) => {
      userData.activities.forEach((activity) => {
        // Only include wishlist opened activities
        if (activity.type === 'wishlist opened') {
          activities.push({
            ...activity,
            user: userData.user,
            userType: userData.userType,
          });
        }
      });
    });
    return activities;
  };

  const webActivities = getAllActivitiesByType('web');
  const mailActivities = getAllActivitiesByType('mail');
  const newsletterClickActivities = getNewsletterClickActivities();
  const weeklyReportClickedActivities = getWeeklyReportClickedActivities();
  const wishlistOpenedActivities = getWishlistOpenedActivities();

  let currentActivities;
  if (activityType === 'web') {
    currentActivities = webActivities;
  } else if (activityType === 'mail') {
    currentActivities = mailActivities;
  } else if (activityType === 'newsletter') {
    currentActivities = newsletterClickActivities;
  } else if (activityType === 'weekly-report-clicked') {
    currentActivities = weeklyReportClickedActivities;
  } else if (activityType === 'wishlist-opened') {
    currentActivities = wishlistOpenedActivities;
  } else {
    currentActivities = [];
  }

  // Enhanced filtering
  const filteredActivities = currentActivities.filter((activity) => {
    const userName = activity.user?.name || '';
    const userEmail = activity.user?.email || '';
    const userMatch =
      userName.toLowerCase().includes(userFilter.toLowerCase()) ||
      userEmail.toLowerCase().includes(userFilter.toLowerCase());
    const regMatch =
      regFilter === '' ||
      (activity.listing?.registration_number || '').toLowerCase().includes(regFilter.toLowerCase());
    // Select box filtering
    const selectUserMatch =
      !selectedUser || (activity.user?.email && activity.user.email === selectedUser);
    const selectListingMatch =
      activityType === 'mail' ||
      activityType === 'wishlist-opened' ||
      (activityType === 'newsletter' && !activity.listing) ||
      !selectedListing ||
      (activity.listing?.id && activity.listing.id.toString() === selectedListing);
    return userMatch && regMatch && selectUserMatch && selectListingMatch;
  });

  // Group activities by listing (only for web/weekly-report-clicked activities)
  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    // For mail, wishlist opened, and newsletter activities without listings, don't group
    if (
      (activityType === 'mail' ||
        activityType === 'wishlist-opened' ||
        activityType === 'newsletter') &&
      !activity.listing
    ) {
      return acc;
    }

    const listingId = activity.listing?.id;
    if (!listingId) return acc;

    if (!acc[listingId]) {
      acc[listingId] = {
        listing: activity.listing,
        activities: [],
      };
    }
    acc[listingId].activities.push(activity);
    return acc;
  }, {});

  const toggleCardCollapse = (listingId) => {
    setCollapsedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  const toggleUserGroupCollapse = (groupKey) => {
    setCollapsedUserGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  // Group activities by user within each listing
  const groupActivitiesByUser = (activities) => {
    return activities.reduce((acc, activity) => {
      const userKey = activity.user && activity.user.email ? activity.user.email : 'unknown';
      if (!acc[userKey]) {
        acc[userKey] = {
          user: activity.user || { name: 'Unknown User', email: 'unknown' },
          userType: activity.userType || 'unknown',
          activities: [],
        };
      }
      acc[userKey].activities.push(activity);
      return acc;
    }, {});
  };

  const handleRetry = () => {
    setActivitiesData({});
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getActivities();
        setActivitiesData(response || {});
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('Failed to load activities. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 rounded-lg shadow-lg">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white ml-3">Loading activities...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 rounded-lg shadow-lg">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={handleRetry}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate unique user and listing options from currentActivities (not filteredActivities)
  const userOptions = Array.from(
    new Set(
      currentActivities.map((a) =>
        a.user?.email ? `${a.user.name}|||${a.user.email}` : 'Unknown User|||unknown'
      )
    )
  ).map((val) => {
    const [name, email] = val.split('|||');
    return { name, email };
  });
  const listingOptions = Array.from(
    new Set(
      currentActivities
        .map((a) =>
          a.listing?.id && a.listing?.registration_number
            ? `${a.listing.id}|||${a.listing.registration_number}|||${a.listing.brand_name}|||${a.listing.model}`
            : ''
        )
        .filter(Boolean)
    )
  ).map((val) => {
    const [id, reg, brand, model] = val.split('|||');
    return { id, reg, brand, model };
  });

  return (
    <div className="min-h-screen bg-gray-900 rounded-lg shadow-lg">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-white">Activity Dashboard</h1>

        {/* Activity Type Toggle */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActivityType('web')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activityType === 'web'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                🖱️ Web Activities ({webActivities.length})
              </button>
              <button
                onClick={() => setActivityType('mail')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activityType === 'mail'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                📧 Mail Activities ({mailActivities.length})
              </button>
              <button
                onClick={() => setActivityType('newsletter')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activityType === 'newsletter'
                    ? 'bg-yellow-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                📰 Newsletter Clicks ({newsletterClickActivities.length})
              </button>
              {/* 
              <button
                onClick={() => setActivityType('weekly-report-clicked')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activityType === 'weekly-report-clicked'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                📊 Weekly Report Clicks ({weeklyReportClickedActivities.length})
              </button>
                  */}
              <button
                onClick={() => setActivityType('wishlist-opened')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activityType === 'wishlist-opened'
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                🔖 Wishlist Opened ({wishlistOpenedActivities.length})
              </button>
            </div>

            <div className="text-sm text-gray-400">
              Showing {filteredActivities.length} of {currentActivities.length} {activityType}{' '}
              activities
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Filter by User</label>
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* User select box */}
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full mt-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Users</option>
                {userOptions.map((u) => (
                  <option key={u.email} value={u.email}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            {/* Only show listing select for web/newsletter/weekly-report-clicked */}
            {(activityType === 'web' ||
              activityType === 'newsletter' ||
              activityType === 'weekly-report-clicked') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Filter by Listing</label>
                <input
                  type="text"
                  value={regFilter}
                  onChange={(e) => setRegFilter(e.target.value)}
                  placeholder="Enter registration number..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={selectedListing}
                  onChange={(e) => setSelectedListing(e.target.value)}
                  className="w-full mt-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Listings</option>
                  {listingOptions.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.brand} {l.model} ({l.reg})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Activity Cards */}
        <div className="space-y-6">
          {/* Activities without listings - displayed as list */}
          {(activityType === 'mail' ||
            activityType === 'wishlist-opened' ||
            activityType === 'newsletter') &&
            filteredActivities.filter((activity) => !activity.listing).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {activityType === 'newsletter'
                    ? 'Newsletter Activities (General)'
                    : activityType === 'mail'
                      ? 'Mail Activities'
                      : 'Wishlist Activities'}
                </h3>
                {filteredActivities
                  .filter((activity) => !activity.listing)
                  .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date))
                  .map((activity, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div>
                          <div className="font-semibold text-white">
                            {activity.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-300">{activity.user?.email || ''}</div>
                          {activity.user?.company && (
                            <div className="text-sm text-gray-400">
                              Company: {activity.user.company}
                            </div>
                          )}
                          {activity.weeklyReportInfo && (
                            <div className="text-sm text-purple-300 mt-1">
                              Week {activity.weeklyReportInfo.week_number},{' '}
                              {activity.weeklyReportInfo.year}(
                              {activity.weeklyReportInfo.week_start_date} -{' '}
                              {activity.weeklyReportInfo.week_end_date})
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`font-medium ${getActivityColor(activity.type)}`}>
                          {getDisplayActivityType(activity.type)}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(activity.activity_date)}
                        </span>
                        {activity.weeklyReportInfo && (
                          <span className="text-xs text-purple-400 mt-1">
                            ID: {activity.weeklyReportInfo.mailgun_message_id}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

          {/* Activities with listings - displayed as grouped cards */}
          {(activityType === 'web' ||
            activityType === 'newsletter' ||
            activityType === 'weekly-report-clicked') &&
            Object.keys(groupedActivities).length > 0 && (
              <div className="space-y-6">
                {activityType === 'newsletter' &&
                  filteredActivities.filter((activity) => !activity.listing).length > 0 && (
                    <h3 className="text-lg font-semibold text-white">
                      Newsletter Activities (Car-specific)
                    </h3>
                  )}
                {Object.values(groupedActivities)
                  .sort((a, b) => {
                    // Get the most recent activity date for each group
                    const getLatestActivityDate = (group) => {
                      return Math.max(
                        ...group.activities.map((activity) =>
                          new Date(activity.activity_date).getTime()
                        )
                      );
                    };

                    const aLatest = getLatestActivityDate(a);
                    const bLatest = getLatestActivityDate(b);

                    // Sort by most recent first (descending order)
                    return bLatest - aLatest;
                  })
                  .map((group) => {
                    const isCardCollapsed = collapsedCards.has(group.listing.id);
                    const userGroups = groupActivitiesByUser(group.activities);

                    return (
                      <div
                        key={group.listing.id}
                        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                      >
                        {/* Listing Header */}
                        <div className="bg-gray-700 px-6 py-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleCardCollapse(group.listing.id)}
                                className="text-gray-400 hover:text-white transition-colors"
                                title={isCardCollapsed ? 'Expand' : 'Collapse'}
                              >
                                <svg
                                  className={`w-5 h-5 transform transition-transform ${
                                    isCardCollapsed ? 'rotate-0' : 'rotate-90'
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                              <div>
                                <h2 className="text-xl font-semibold text-white">
                                  {group.listing.brand_name} {group.listing.model}
                                </h2>
                                <p className="text-gray-300 text-sm">
                                  Price: €{Number(group.listing.listing_price).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                                {group.activities.length}{' '}
                                {group.activities.length === 1 ? 'activity' : 'activities'}
                              </span>
                              <div className="flex items-center gap-2 text-md font-semibold text-gray-300">
                                <span>Ref: {group.listing.registration_number}</span>
                                <button
                                  onClick={() => navigate(`/listing/${group.listing.id}`)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="View listing details"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Activities - Collapsible */}
                        {!isCardCollapsed && (
                          <div className="p-6 space-y-4">
                            {Object.values(userGroups).map((userGroup) => {
                              const userGroupKey = `${group.listing.id}-${userGroup.user.email}`;
                              const isUserGroupCollapsed = collapsedUserGroups.has(userGroupKey);

                              return (
                                <div
                                  key={userGroup.user.email}
                                  className="bg-gray-700 rounded-lg overflow-hidden"
                                >
                                  {/* User Group Header */}
                                  <div className="p-4 bg-gray-600">
                                    <div className="flex items-center justify-between">
                                      <button
                                        onClick={() => toggleUserGroupCollapse(userGroupKey)}
                                        className="flex items-center gap-3 text-left flex-1 hover:bg-gray-500 p-2 rounded transition-colors"
                                        title={
                                          isUserGroupCollapsed
                                            ? 'Expand user activities'
                                            : 'Collapse user activities'
                                        }
                                      >
                                        <svg
                                          className={`w-4 h-4 transform transition-transform text-gray-400 ${
                                            isUserGroupCollapsed ? 'rotate-0' : 'rotate-90'
                                          }`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                          />
                                        </svg>
                                        <div className="flex items-center gap-3">
                                          <span className="text-2xl">
                                            {getActivityIcon(userGroup.activities[0].type)}
                                          </span>
                                          <div>
                                            <h3 className="font-semibold text-white">
                                              {userGroup.user.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-sm text-gray-300">
                                                {userGroup.user.email}
                                              </span>
                                              <span
                                                className={`text-xs px-2 py-1 rounded-full ${getUserTypeBadgeColor(userGroup.userType)}`}
                                              >
                                                {getUserTypeLabel(userGroup.userType)}
                                              </span>
                                            </div>
                                            {userGroup.user.company && (
                                              <p className="text-sm text-gray-400">
                                                Company: {userGroup.user.company}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </button>
                                      <span className="text-sm bg-gray-700 px-3 py-1 rounded-full text-gray-300">
                                        {userGroup.activities.length}{' '}
                                        {userGroup.activities.length === 1
                                          ? 'activity'
                                          : 'activities'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* User Activities - Collapsible */}
                                  {!isUserGroupCollapsed && (
                                    <div className="p-4 space-y-3">
                                      {userGroup.activities.map((activity, index) => (
                                        <div
                                          key={index}
                                          className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span
                                              className={`font-medium ${getActivityColor(activity.type)}`}
                                            >
                                              {getDisplayActivityType(activity.type)}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                              {formatDate(activity.activity_date)}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

          {filteredActivities.length === 0 && Object.keys(groupedActivities).length === 0 && (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <div className="text-4xl mb-4">
                {activityType === 'web'
                  ? '🖱️'
                  : activityType === 'mail'
                    ? '📧'
                    : activityType === 'newsletter'
                      ? '📰'
                      : activityType === 'weekly-report-clicked'
                        ? '📊'
                        : '🔖'}
              </div>
              <p className="text-gray-400 text-lg mb-2">
                No{' '}
                {activityType === 'web'
                  ? 'web'
                  : activityType === 'mail'
                    ? 'mail'
                    : activityType === 'newsletter'
                      ? 'newsletter click'
                      : activityType === 'weekly-report-clicked'
                        ? 'weekly report click'
                        : 'wishlist opened'}{' '}
                activities found
              </p>
              <p className="text-gray-500 text-sm">
                {userFilter || regFilter
                  ? 'Try adjusting your filters to see more results.'
                  : `No ${activityType === 'web' ? 'web' : activityType === 'mail' ? 'mail' : activityType === 'newsletter' ? 'newsletter click' : activityType === 'weekly-report-clicked' ? 'weekly report click' : 'wishlist opened'} activities have been recorded yet.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
