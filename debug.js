
// Ensure the object or promise is properly initialized
function handlePromise(promise) {
    if (!promise || typeof promise !== 'object') {
        throw new Error('Invalid promise object');
    }

    // Check if the 'fulfilled' property exists
    if (!('fulfilled' in promise)) {
        throw new Error("'fulfilled' property is missing in the promise object");
    }

    // Safely access the 'fulfilled' property
    return promise.fulfilled;
}

// Example usage
try {
    const promise = {
        fulfilled: true, // Ensure this property exists
    };

    const result = handlePromise(promise);
    console.log('Promise fulfilled:', result);
} catch (error) {
    console.error('Error:', error.message);
}