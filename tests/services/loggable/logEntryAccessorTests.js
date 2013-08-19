// TODO: complete when $http stuff figured out.
xdescribe('logEntryAccessor'
	// it returns a promise to a Collection of loggable objects
	// it calls endpoints for both behavior incidents and point losses
	// all objects from it are read-only (because of id changes, also they should be)
	// it returns all entries with no date range
	// it respects startDate and endDate
	// collection is sorted by getOccurredAt in decr order
);
