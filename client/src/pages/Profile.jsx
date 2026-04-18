import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import {
  User,
  Briefcase,
  Settings,
  ChevronRight,
  Lock,
  LogOut,
  Camera,
  Edit2,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import UserAvatar from '../components/ui/UserAvatar';
import '../styles/profile.css';

const Profile = () => {
  const { user, updateProfile, uploadAvatar, removeAvatar, logout, changePassword } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    department: user?.department || '',
    role: user?.role || '',
    skills: user?.skills?.join(', ') || '',
    officeLocation: user?.officeLocation || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        department: user.department || '',
        role: user.role || '',
        skills: user.skills?.join(', ') || '',
        officeLocation: user.officeLocation || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const filteredValue = value.replace(/[^0-9+\-() ]/g, '');
      setFormData({ ...formData, [name]: filteredValue });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const hasChanges = user && (
    formData.fullName !== (user.name || '') ||
    formData.email !== (user.email || '') ||
    formData.phone !== (user.phone || '') ||
    formData.location !== (user.location || '') ||
    formData.department !== (user.department || '') ||
    formData.role !== (user.role || '') ||
    formData.skills !== (user.skills?.join(', ') || '') ||
    formData.officeLocation !== (user.officeLocation || '')
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const success = await updateProfile(formData);

    if (success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    }
    setLoading(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setMessage({ type: '', text: '' });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMessage({ type: '', text: '' });
    const success = await uploadAvatar(file);
    if (success) {
      setMessage({ type: 'success', text: 'Profile photo updated!' });
    } else {
      setMessage({ type: 'error', text: 'Failed to upload photo.' });
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      setMessage({ type: '', text: '' });
      const success = await removeAvatar();
      if (success) {
        setMessage({ type: 'success', text: 'Profile photo removed!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to remove photo.' });
      }
    }
  };


  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill all password fields.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setPasswordLoading(true);
    const result = await changePassword(passwordData);
    setPasswordLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      resetPasswordForm();
      setShowPasswordForm(false);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };



  return (
    <div className="profile-page-content p-8">
      <div className="profile-container">

        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-left">
            <div className="profile-avatar-wrapper">
              <UserAvatar
                user={user}
                size="giant"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
              />
              <button className="profile-camera-btn" onClick={handleAvatarClick} title="Update Photo">
                <Camera size={16} />
              </button>
              {user?.avatar && user.avatar !== 'default-avatar.png' && (
                <button className="profile-remove-avatar-btn" onClick={handleRemoveAvatar} title="Remove Photo">
                  <Trash2 size={16} />
                </button>
              )}

            </div>
            <div className="profile-header-info">
              <h1>{user?.name || 'User'}</h1>
              <p className="profile-header-role">{user?.role || 'Not provided'}</p>

            </div>
          </div>
          <div className="profile-header-actions">
            {!isEditing ? (
              <button className="profile-edit-btn" onClick={handleEditToggle}>
                <Edit2 size={18} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-3">
                {hasChanges && (
                  <button
                    className="profile-save-header-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
                <button
                  type="button"
                  className="profile-cancel-header-btn"
                  onClick={handleEditToggle}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`profile-alert ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <Lock size={18} />}
            <p>{message.text}</p>
          </div>
        )}

        {/* Main Content */}
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="profile-grid">
              <div className="profile-main-col">
                {/* Personal Information */}
                <section className="profile-section">
                  <div className="profile-section-header">
                    <User size={20} className="profile-section-header-icon" />
                    <h2>Personal Information</h2>
                  </div>
                  <div className="profile-edit-form">
                    <div className="profile-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>

                {/* Work Details */}
                <section className="profile-section">
                  <div className="profile-section-header">
                    <Briefcase size={20} className="profile-section-header-icon" />
                    <h2>Work Details</h2>
                  </div>
                  <div className="profile-edit-form">
                    <div className="profile-form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Job Title</label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Skills</label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="e.g. html, css, js"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Office Location</label>
                      <input
                        type="text"
                        name="officeLocation"
                        value={formData.officeLocation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="profile-side-col">
                <section className="profile-section">
                  <div className="profile-section-header">
                    <Settings size={20} className="profile-section-header-icon" />
                    <h2>Save Changes</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p className="text-sm text-gray-500">
                      You have unsaved changes. Click the button below to update your profile.
                    </p>
                    <button
                      type="submit"
                      className="profile-password-submit-btn"
                      disabled={loading || !hasChanges}
                    >
                      {loading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                    <button
                      type="button"
                      className="profile-logout-btn"
                      onClick={handleEditToggle}
                      style={{ justifyContent: 'center' }}
                    >
                      Cancel Editing
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </form>
        ) : (
          <div className="profile-grid">
            {/* Left Column */}
            <div className="profile-main-col">
              {/* Personal Information */}
              <section className="profile-section">
                <div className="profile-section-header">
                  <User size={20} className="profile-section-header-icon" />
                  <h2>Personal Information</h2>
                </div>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <p className="profile-info-label">Full Name</p>
                    <p className="profile-info-value">{user?.name || 'User'}</p>
                  </div>
                  <div className="profile-info-item">
                    <p className="profile-info-label">Email Address</p>
                    <p className="profile-info-value">{user?.email || 'user@promanage.com'}</p>
                  </div>
                  <div className="profile-info-item">
                    <p className="profile-info-label">Phone Number</p>
                    <p className="profile-info-value">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div className="profile-info-item">
                    <p className="profile-info-label">Location</p>
                    <p className="profile-info-value">{user?.location || 'Not provided'}</p>
                  </div>
                </div>
              </section>

              {/* Work Details */}
              <section className="profile-section">
                <div className="profile-section-header">
                  <Briefcase size={20} className="profile-section-header-icon" />
                  <h2>Work Details</h2>
                </div>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <p className="profile-info-label">Department</p>
                    <p className="profile-info-value">{user?.department || 'Not provided'}</p>
                  </div>
                  <div className="profile-info-item">
                    <p className="profile-info-label">Job Title</p>
                    <p className="profile-info-value">{user?.role || 'Not provided'}</p>
                  </div>
                  <div className="profile-info-item">
                    <p className="profile-info-label">Skills</p>
                    <p className="profile-info-value">{user?.skills?.length > 0 ? user.skills.join(', ') : 'Not provided'}</p>
                  </div>
                  <div className="profile-info-item">
                    <p className="profile-info-label">Office Location</p>
                    <p className="profile-info-value">{user?.officeLocation || 'Not provided'}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="profile-side-col">
              {/* Account Settings */}
              <section className="profile-section">
                <div className="profile-section-header">
                  <Settings size={20} className="profile-section-header-icon" />
                  <h2>Account Settings</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    className="profile-settings-btn"
                    onClick={() => {
                      setShowPasswordForm((prev) => !prev);
                      setMessage({ type: '', text: '' });
                      if (showPasswordForm) {
                        resetPasswordForm();
                      }
                    }}
                  >
                    <div className="left">
                      <Lock size={18} />
                      <span>{showPasswordForm ? 'Hide Password Form' : 'Change Password'}</span>
                    </div>
                    <div className="right">
                      <ChevronRight size={18} />
                    </div>
                  </button>
                  {showPasswordForm && (
                    <form className="profile-password-form" onSubmit={handlePasswordSubmit}>
                      <div className="profile-form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordFieldChange}
                        />
                      </div>
                      <div className="profile-form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordFieldChange}
                        />
                      </div>
                      <div className="profile-form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordFieldChange}
                        />
                      </div>
                      <button className="profile-password-submit-btn" type="submit" disabled={passwordLoading}>
                        {passwordLoading ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </form>
                  )}
                  <div className="profile-settings-divider">
                    <p className="profile-notif-label">Notifications</p>
                    <div className="profile-notif-row">
                      <span>Email Alerts</span>
                      <button className="profile-toggle on">
                        <div className="profile-toggle-knob"></div>
                      </button>
                    </div>
                    <div className="profile-notif-row">
                      <span>Project Mentions</span>
                      <button className="profile-toggle off">
                        <div className="profile-toggle-knob"></div>
                      </button>
                    </div>
                  </div>
                  <div className="profile-settings-divider">
                    <button className="profile-logout-btn" onClick={logout}>
                      <LogOut size={18} />
                      <span>Logout Session</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      <div className="profile-footer">
        <p>© 2026 SPMS. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Profile;
