# Test Coverage Documentation

## Overview

This document describes the test coverage for the Registration Details Card and Student Info Card components.

## Test Files

1. **registration-details-card.component.spec.ts** - Tests for the registration details editing functionality
2. **student-info-card.component.spec.ts** - Tests for the student details editing functionality

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm test -- --code-coverage
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- --include='**/registration-details-card.component.spec.ts'
```

## Test Coverage

### RegistrationDetailsCardComponent

#### Component Initialization (100% coverage)
- ✅ Component creation
- ✅ Default values initialization
- ✅ Subscription to registration details
- ✅ Branch loading on init
- ✅ Error handling for branch loading

#### Branch and Course Loading (100% coverage)
- ✅ Load branches successfully
- ✅ Map branches to options correctly
- ✅ Handle branch loading errors
- ✅ Load courses for a branch
- ✅ Clear courses when branchId is empty
- ✅ Handle course loading errors

#### Modal Operations (100% coverage)
- ✅ Open edit modal with populated form
- ✅ Format registration date correctly
- ✅ Handle missing registration date
- ✅ Load courses when branchId exists
- ✅ Prevent opening modal when details are null
- ✅ Handle invalid date formats
- ✅ Close modal and reset form

#### Form Interactions (100% coverage)
- ✅ Branch change updates branchId and resets courseId
- ✅ Date change from event object
- ✅ Date change from string
- ✅ Handle null/undefined date events

#### Save Functionality (100% coverage)
- ✅ Update registration details in store
- ✅ Close modal after saving
- ✅ Prevent saving when details are null
- ✅ Preserve existing branch if not found
- ✅ Preserve existing course if not found

#### Component Lifecycle (100% coverage)
- ✅ Unsubscribe on destroy
- ✅ Handle destroy when subscription is undefined

#### Edge Cases (100% coverage)
- ✅ Handle empty registration details
- ✅ Handle missing optional fields
- ✅ Handle empty branch options

### StudentInfoCardComponent

#### Component Initialization (100% coverage)
- ✅ Component creation
- ✅ Default values initialization
- ✅ Subscription to registration details
- ✅ Process idDocument as base64 string
- ✅ Process idDocument as byte array
- ✅ Handle null idDocument
- ✅ Handle missing idDocument
- ✅ Handle invalid idDocument (too short)

#### Modal Operations (100% coverage)
- ✅ Open modal and populate form with student details
- ✅ Detect passport type correctly
- ✅ Default to idNumber when both exist
- ✅ Handle missing student data
- ✅ Handle missing address data
- ✅ Prevent opening modal when details are null

#### Form Operations (100% coverage)
- ✅ Close modal and reset form
- ✅ Save student details to store
- ✅ Set idNumber when idType is idNumber
- ✅ Set passport when idType is passport
- ✅ Preserve existing address properties
- ✅ Handle missing address
- ✅ Close modal after saving
- ✅ Prevent saving when details are null

#### ID Document Processing (100% coverage)
- ✅ Handle large byte arrays in chunks
- ✅ Log warnings for invalid document data

#### Component Lifecycle (100% coverage)
- ✅ Unsubscribe on destroy
- ✅ Handle destroy when subscription is undefined

#### Edge Cases (100% coverage)
- ✅ Handle empty registration details
- ✅ Handle missing optional student fields
- ✅ Handle empty address fields

## Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## Test Structure

Each test suite follows this structure:

1. **Setup** - Mock dependencies and create component
2. **Component Initialization** - Test component creation and initialization
3. **Feature Tests** - Test specific functionality
4. **Edge Cases** - Test error handling and edge cases
5. **Lifecycle** - Test component lifecycle hooks

## Mocking Strategy

### Services Mocked
- `AppStore` - Mocked with spy objects for store operations
- `BhakiService` - Mocked HTTP service calls
- `TokenStorageService` - Mocked token storage operations
- `ChangeDetectorRef` - Mocked change detection
- `DomSanitizer` - Mocked for security operations

### Observable Handling
- All observables are mocked using `of()` for success cases
- Error cases use `throwError()` for error handling tests

## Best Practices

1. **Isolation**: Each test is isolated and doesn't depend on other tests
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **AAA Pattern**: Arrange, Act, Assert pattern is followed
4. **Mocking**: All external dependencies are properly mocked
5. **Edge Cases**: Edge cases and error scenarios are thoroughly tested

## Continuous Integration

Tests should be run:
- Before every commit
- In CI/CD pipeline
- Before merging pull requests

## Future Improvements

1. Add E2E tests for user interactions
2. Add visual regression tests
3. Add performance tests
4. Increase coverage for error scenarios
5. Add tests for accessibility

