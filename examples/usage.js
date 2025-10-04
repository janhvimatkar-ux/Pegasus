/**
 * Example usage of the Live Class Service
 * 
 * This file demonstrates how to use the liveClassService programmatically
 * Run with: node examples/usage.js
 */

const liveClassService = require('../src/services/liveClassService');
const logger = require('../src/utils/logger');

async function runExamples() {
  logger.info('Starting usage examples...');

  try {
    // Example 1: Schedule a basic live class
    logger.info('Example 1: Scheduling a basic live class');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    
    const result1 = await liveClassService.schedule_live_class(
      'instructor-alice',
      'course-mathematics-101',
      futureDate.toISOString()
    );
    
    logger.info('Live class scheduled:', result1.liveClass.toJSON());
    console.log('\n✅ Class scheduled successfully!');
    console.log('Zoom Join URL:', result1.liveClass.zoomJoinUrl);
    console.log('Zoom Start URL:', result1.liveClass.zoomStartUrl);
    console.log('Meeting Password:', result1.zoomMeeting.password || 'N/A');
    
    // Example 2: Schedule a class with custom duration and topic
    logger.info('\nExample 2: Scheduling with custom options');
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 14); // 14 days from now
    
    const result2 = await liveClassService.schedule_live_class(
      'instructor-bob',
      'course-physics-201',
      futureDate2.toISOString(),
      {
        duration: 90,
        topic: 'Quantum Mechanics - Introduction',
        timezone: 'America/New_York',
        participants: [
          { name: 'Alice Smith', email: 'alice@example.com', role: 'student' },
          { name: 'Bob Johnson', email: 'bob@example.com', role: 'student' }
        ]
      }
    );
    
    logger.info('Live class with options scheduled:', result2.liveClass.toJSON());
    console.log('\n✅ Custom class scheduled with calendar invites!');
    console.log('Duration:', result2.liveClass.duration, 'minutes');
    console.log('Invitations sent:', result2.invitations ? result2.invitations.recipients : 0);
    
    // Example 3: Retrieve classes by course
    logger.info('\nExample 3: Getting all classes for a course');
    
    const courseClasses = liveClassService.getLiveClassesByCourse('course-mathematics-101');
    console.log('\n✅ Found', courseClasses.length, 'class(es) for course-mathematics-101');
    
    // Example 4: Retrieve classes by instructor
    logger.info('\nExample 4: Getting all classes for an instructor');
    
    const instructorClasses = liveClassService.getLiveClassesByInstructor('instructor-alice');
    console.log('✅ Found', instructorClasses.length, 'class(es) for instructor-alice');
    
    // Example 5: Get a specific class
    logger.info('\nExample 5: Getting a specific class by ID');
    
    const retrievedClass = liveClassService.getLiveClass(result1.liveClass.id);
    if (retrievedClass) {
      console.log('✅ Retrieved class:', retrievedClass.id);
      console.log('Status:', retrievedClass.status);
    }
    
    // Example 6: Cancel a class
    logger.info('\nExample 6: Cancelling a live class');
    
    const cancelledClass = await liveClassService.cancelLiveClass(result2.liveClass.id);
    console.log('✅ Class cancelled:', cancelledClass.id);
    console.log('New status:', cancelledClass.status);
    
    // Example 7: Update class status
    logger.info('\nExample 7: Updating class status');
    
    const updatedClass = liveClassService.updateStatus(result1.liveClass.id, 'active');
    console.log('✅ Status updated to:', updatedClass.status);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log('- Total classes in system:', liveClassService.liveClasses.size);
    console.log('- All examples completed successfully!');
    console.log('='.repeat(50));
    
  } catch (error) {
    logger.logError(error, { context: 'usage-examples' });
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples()
    .then(() => {
      console.log('\n✨ All examples completed!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runExamples };

