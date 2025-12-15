import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PublicProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.post(
          'https://pg-cards.vercel.app/userProfile/getUser',
          { userId },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (res.data?.code === 200) {
          setProfile(res.data.data);
        } else {
          setError(res.data?.msg || 'Profile not found');
        }
      } catch (err) {
        console.error('Public profile fetch error:', err);
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loader" />
        <p className="loadingText">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="errorContainer">
        <h2 className="errorTitle">Profile not available</h2>
        <p className="errorText">{error || 'This profile could not be found.'}</p>
      </div>
    );
  }

  const { fullName, companyName, companyDesignation, about, phoneNumbers, emails, socialMedia, contactDetails } =
    profile;

  return (
    <div className="publicProfileRoot">
      <div className="publicProfileCard">
        <div className="publicProfileHeader">
          <h1 className="publicName">{fullName || 'PG Cards User'}</h1>
          {(companyName || companyDesignation) && (
            <p className="publicTitle">
              {companyDesignation && <span>{companyDesignation}</span>}
              {companyName && (
                <>
                  {companyDesignation && ' · '}
                  <span>{companyName}</span>
                </>
              )}
            </p>
          )}
        </div>

        {about && <p className="publicAbout">{about}</p>}

        <div className="publicGrid">
          {(phoneNumbers?.length || emails?.length) && (
            <div className="publicSection">
              <h3>Contact</h3>
              <ul>
                {phoneNumbers
                  ?.filter(p => p.number)
                  .map((p, i) => (
                    <li key={i}>
                      <strong>{p.label || 'Phone'}:</strong> {p.number}
                    </li>
                  ))}
                {emails
                  ?.filter(e => e.emailAddress)
                  .map((e, i) => (
                    <li key={`e-${i}`}>
                      <strong>Email:</strong> {e.emailAddress}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {(contactDetails?.address ||
            contactDetails?.city ||
            contactDetails?.state ||
            contactDetails?.country ||
            contactDetails?.googleMapLink) && (
            <div className="publicSection">
              <h3>Address</h3>
              <p>
                {contactDetails.address && <span>{contactDetails.address}</span>}
                {(contactDetails.city || contactDetails.state) && (
                  <>
                    <br />
                    <span>
                      {contactDetails.city}
                      {contactDetails.state && contactDetails.city ? ', ' : ''}
                      {contactDetails.state}
                    </span>
                  </>
                )}
                {contactDetails.country && (
                  <>
                    <br />
                    <span>{contactDetails.country}</span>
                  </>
                )}
              </p>
              {contactDetails.googleMapLink && (
                <a
                  href={contactDetails.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="publicLink"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          )}

          {socialMedia?.length > 0 && (
            <div className="publicSection">
              <h3>Social</h3>
              <div className="publicSocialList">
                {socialMedia.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="publicSocialChip"
                  >
                    {s.platform || 'Link'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;



