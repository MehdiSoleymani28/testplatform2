
/**
 * Creates a user-friendly error message from a caught exception.
 * @param error The caught error object.
 * @param context A string describing the operation that failed (e.g., "HTML Analysis").
 * @returns A new Error object with a user-friendly message.
 */
export const createAiError = (error: unknown, context: string): Error => {
    console.error(`Error during ${context}:`, error);

    let errorMessage = `An unexpected error occurred during ${context}. Please try again.`;
    if (error instanceof Error) {
        // Provide more specific feedback for common, user-fixable issues.
        if (error.message.includes('API key not valid')) {
            errorMessage = "The provided AI API Key is invalid. Please check the key in the Settings page.";
        } else if (error.message.includes('permission')) {
            errorMessage = "The provided AI API Key lacks the necessary permissions to perform this action.";
        } else if (error.message.includes('timed out') || error.message.includes('network')) {
            errorMessage = "The request to the AI service timed out. Please check your network connection and try again.";
        } else if (error.message.includes('429')) { // Rate limiting
             errorMessage = "The AI service is currently busy. Please wait a moment and try again.";
        } else if (error.message.includes('Rpc failed due to xhr error')) {
            errorMessage = `A network error occurred while communicating with the AI service. This can be caused by browser extensions (like ad-blockers), firewalls, or a temporary service interruption. Please check your network and try again.`;
        } else if (error.message.startsWith("The AI returned") || error.message.includes("not yet implemented")) {
            // Passthrough for our custom parsing/validation errors or implementation errors
            errorMessage = error.message;
        }
    }
    return new Error(errorMessage);
}