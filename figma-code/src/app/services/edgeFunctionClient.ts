import { supabase } from './supabase';
import { toast } from 'sonner';

/**
 * Wrapper for Supabase Edge Function calls that handles authentication and session refresh
 * 
 * IMPORTANT: This wrapper uses the authenticated Supabase client (supabase.functions.invoke)
 * which automatically handles:
 * - Attaching the Authorization header with the user's JWT token
 * - CORS headers for cross-origin requests
 * - Proper request formatting
 * 
 * DO NOT use fetch() to manually call edge functions. Always use this wrapper.
 * 
 * Usage:
 * ```typescript
 * const { data, error } = await invokeEdgeFunction('estimate_food', {
 *   body: { text: 'chicken salad', save: true }
 * });
 * ```
 * 
 * Features:
 * - Checks for valid session before making the call
 * - Automatically retries once if 401 error occurs
 * - Refreshes session on JWT expiration
 * - Routes to login if authentication fails
 * - Works across any domain/origin
 * - Does NOT require manual Authorization headers (handled by supabase client)
 * 
 * @param functionName The name of the edge function (e.g., 'estimate_food', 'generate_insights')
 * @param options Optional request options including body and headers
 * @returns Promise with data and error (matching Supabase client response format)
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<{ data: T | null; error: any }> {
  
  // Step 1: Check if session exists before making the call
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session) {
    console.error('No active session found, redirecting to login');
    toast.error('Please log in to continue');
    window.location.href = '/login';
    return { data: null, error: new Error('No active session') };
  }

  // Step 2: Make the initial edge function call
  const makeRequest = async () => {
    return await supabase.functions.invoke(functionName, options);
  };

  let response = await makeRequest();

  // Step 3: Handle 401 errors (Invalid JWT / expired session)
  if (response.error) {
    const isAuthError = 
      response.error.message?.includes('Invalid JWT') ||
      response.error.message?.includes('JWT') ||
      response.error.message?.includes('Unauthorized') ||
      response.error.message?.includes('401');

    if (isAuthError) {
      console.log('Session expired, attempting to refresh...');
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh failed:', refreshError);
        
        // Sign out and redirect to login with neutral message
        await supabase.auth.signOut();
        toast('Your session has expired. Please log in again.');
        window.location.href = '/login';
        
        return { data: null, error: new Error('Session expired') };
      }

      console.log('Session refreshed successfully, retrying request...');
      
      // Retry the request once with the new session
      response = await makeRequest();
      
      // If still failing after retry, sign out
      if (response.error) {
        const stillAuthError = 
          response.error.message?.includes('Invalid JWT') ||
          response.error.message?.includes('JWT') ||
          response.error.message?.includes('Unauthorized') ||
          response.error.message?.includes('401');
        
        if (stillAuthError) {
          console.error('Request still failing after session refresh, signing out');
          await supabase.auth.signOut();
          toast('Unable to authenticate. Please log in again.');
          window.location.href = '/login';
          
          return { data: null, error: new Error('Authentication failed') };
        }
      }
    }
  }

  return response;
}