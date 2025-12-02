# Changelog

All notable changes to the Expenses Tracker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2025-12-02

### 🎉 Status: All Critical Bugs Fixed - Production Ready

### Fixed
- **CRITICAL**: Data persistence and API sync issues - deleted items no longer reappear after refresh
- **CRITICAL**: Backend deletion now verifies user ownership before deletion (security fix)
- **CRITICAL**: ID mapping system - frontend and backend IDs now properly synchronized
- **CRITICAL**: Backend-generated IDs used for all new accounts
- **HIGH**: 2FA authentication flow completed with TOTP and backup codes
- **HIGH**: Auth middleware now includes full user object
- **MEDIUM**: Currency symbol now uses formatCurrency() instead of hardcoded $
- **MEDIUM**: TypeScript build errors resolved for Render deployment
- **MEDIUM**: Cross-browser API environment variable consistency
- **MEDIUM**: Admin panel user sync from backend API

### Removed
- Google Sheets integration (performance improvement)
- Orphaned code and unused dependencies
- Blocking operations that slowed down the app

### Added
- Token Debugger tool for authentication troubleshooting
- Data Cleanup tool in Dashboard
- Enhanced security with user verification
- Improved error handling across all operations
- Automatic data validation and cleanup on load
- Fallback for local-only account deletion

### Changed
- Made deletion local-first with backend sync
- Optimized API calls for better performance
- Improved state management in all delete functions
- Simplified data flow by removing Google Sheets
- Reduced bundle size

### Security
- Added user verification to all backend delete endpoints
- Implemented ownership checks before deletion
- Enhanced security for all CRUD operations

---

## [1.2.0] - 2025-11-30

### Added
- Smart features: spending insights, category suggestions, and analytics
- Activity logging system
- Investment tracking
- Shared wallets
- Comprehensive documentation

### Fixed
- Android app connectivity issues
- Vercel environment variables configuration

---

## [1.1.0] - 2025-11-29

### Added
- Google Sheets integration (later removed in v1.3.0)
- Data export features
- Budget management
- MongoDB backup system with automated daily backups

### Changed
- Bank account card size to match credit card size (550px)

---

## [1.0.0] - 2025-11-23

### Added
- Initial release
- Basic expense tracking
- User authentication with JWT
- Multi-account support (bank accounts, credit cards, loans)
- Transaction management
- MongoDB Atlas integration
- Admin panel
- Android app
- Vercel deployment configuration

---

## Migration Guide

### Upgrading to v1.3.0 from v1.2.0 or earlier

1. **Clear localStorage**: Old data may have ID inconsistencies
   ```javascript
   localStorage.clear()
   ```

2. **Re-login**: Refresh authentication tokens by logging out and back in

3. **Verify data**: Use the new Data Cleanup tool in Dashboard to validate data integrity

4. **Google Sheets**: Integration has been removed. If you were using it, export your data before upgrading

---

## Development Tools

### v1.3.0 Tools

#### Token Debugger
- **Location**: Dashboard → Settings
- **Purpose**: Troubleshoot authentication issues
- **Features**: View JWT token, decode payload, check expiration, verify claims

#### Data Cleanup Tool
- **Location**: Dashboard
- **Purpose**: Clean up orphaned data and fix inconsistencies
- **Features**: Remove orphaned transactions, fix ID mismatches, validate data integrity

---

## Performance Improvements

### v1.3.0
- Removed blocking Google Sheets operations
- Optimized API calls
- Improved state management
- Better error handling
- Faster deletion operations
- Reduced bundle size

---

## Known Issues

### v1.3.0
- None - All critical bugs have been resolved ✅

---

## Testing Status

### v1.3.0
- ✅ Delete operations verified across all entity types
- ✅ Update operations verified
- ✅ Add operations verified
- ✅ Data persistence across sessions verified
- ✅ Backend sync verified
- ✅ Tested on multiple browsers
- ✅ Mobile app compatibility verified

---

## Contributors

- Nasir Ayub (@syednasirayub17)

---

## Links

- [Repository](https://github.com/syednasirayub17/expenses-tracker-2)
- [Bug Tracker](./BUGS.md)
- [Documentation](./DOCUMENTATION.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Last Updated**: December 2, 2025
