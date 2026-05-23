import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email configuration
const SENDER_EMAIL = 'onboarding@resend.dev'; // Change to your domain email after verification
const APP_URL = 'http://localhost:3000'; // Change to production URL

// Email template functions
function generateInviteEmailHTML(name: string, role: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Kokurikulum Dashboard!</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>You have been invited to join the <strong>Kokurikulum Dashboard</strong> at SM Konven St. Ursula.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your Role:</strong> ${role}</p>
        </div>
        <p>Click the button below to set up your password and access the dashboard:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/reset-password" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Set Up Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy this link: ${APP_URL}/reset-password</p>
        <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; margin: 0;">This is an automated message from Kokurikulum Dashboard. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function generatePasswordResetEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your password has been reset by an administrator.</p>
        <p>Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/reset-password" style="display: inline-block; background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Set New Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy this link: ${APP_URL}/reset-password</p>
        <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; margin: 0;">This is an automated message from Kokurikulum Dashboard. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function generateRequestConfirmationEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #10b981; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Request Received</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your access request has been <strong>received</strong> and is pending admin approval.</p>
        <p>You will receive another email once your request has been reviewed.</p>
        <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; margin: 0;">Kokurikulum Dashboard - SM Konven St. Ursula</p>
      </div>
    </body>
    </html>
  `;
}

function generateRequestApprovedEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #10b981; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Request Approved! 🎉</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Great news! Your access request has been <strong>approved</strong>.</p>
        <p>You can now log in to the Kokurikulum Dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/login" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Log In Now</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; margin: 0;">Kokurikulum Dashboard - SM Konven St. Ursula</p>
      </div>
    </body>
    </html>
  `;
}

function generateRequestRejectedEmailHTML(name: string, reason?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #ef4444; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Request Update</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Unfortunately, your access request has been <strong>rejected</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you believe this is an error, please contact the school administration.</p>
        <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; margin: 0;">Kokurikulum Dashboard - SM Konven St. Ursula</p>
      </div>
    </body>
    </html>
  `;
}

// Send email via Resend
async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY') || '');
    
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (err) {
    console.error('Email send exception:', err);
    return { success: false, error: String(err) };
  }
}

interface SimilarName {
  name: string;
  similarity: number;
  source: string;
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 100;
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return Math.round((1 - distance / maxLen) * 100);
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/bin\s+/gi, ' ').replace(/binti\s+/gi, ' ').trim();
}

function getNameTokens(name: string): string[] {
  const normalized = normalizeName(name);
  const stopWords = ['dan', 'of', 'the', 'bin', 'binti'];
  return normalized.split(' ').filter(token => token.length > 1 && !stopWords.includes(token));
}

function calculateTokenSimilarity(inputName: string, targetName: string): number {
  const inputTokens = getNameTokens(inputName);
  const targetTokens = getNameTokens(targetName);
  if (inputTokens.length === 0 || targetTokens.length === 0) return calculateSimilarity(inputName, targetName);
  let matchedTokens = 0;
  for (const inputToken of inputTokens) {
    for (const targetToken of targetTokens) {
      const tokenSim = calculateSimilarity(inputToken, targetToken);
      if (tokenSim >= 80) { matchedTokens++; break; }
    }
  }
  const matchRatio = (matchedTokens * 2) / (inputTokens.length + targetTokens.length);
  return Math.round(matchRatio * 100);
}

function findSimilarNamesLocal(
  inputName: string,
  existingNames: Array<{ name: string; source: string }>,
  threshold: number = 80,
  limit: number = 5
): SimilarName[] {
  if (!inputName || inputName.length < 2) return [];
  const results: SimilarName[] = [];
  for (const { name, source } of existingNames) {
    if (!name || name.trim() === '') continue;
    if (normalizeName(name) === normalizeName(inputName)) {
      results.push({ name, similarity: 100, source });
      continue;
    }
    let similarity = 0;
    const normalizedInput = normalizeName(inputName);
    const normalizedTarget = normalizeName(name);
    if (normalizedTarget.includes(normalizedInput) || normalizedInput.includes(normalizedTarget)) {
      similarity = Math.max(calculateSimilarity(inputName, name), calculateTokenSimilarity(inputName, name), 90);
    } else {
      const fullSim = calculateSimilarity(inputName, name);
      const tokenSim = calculateTokenSimilarity(inputName, name);
      similarity = Math.max(fullSim, tokenSim);
    }
    if (similarity >= threshold) {
      results.push({ name, similarity, source });
    }
  }
  results.sort((a, b) => {
    if (b.similarity !== a.similarity) return b.similarity - a.similarity;
    return a.name.localeCompare(b.name);
  });
  return results.slice(0, limit);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, email, fullName, password, requestType, requestId, notes, userId, newPassword, confirmedDuplicate, name, threshold, matchedTeacherName } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // ACTION: Find similar teacher names from 2025 database
    if (action === 'findSimilarNames') {
      if (!name || name.length < 2) {
        return new Response(JSON.stringify({ similarNames: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const teacherThreshold = threshold || 60; // Lower threshold for better matching
      const existingNames: Array<{ name: string; source: string }> = [];

      // Fetch from management_team
      const { data: managementData, error: managementError } = await supabaseAdmin
        .from('management_team')
        .select('teacher_name')
        .not('teacher_name', 'is', null)
        .neq('teacher_name', '');

      if (!managementError && managementData) {
        for (const row of managementData) {
          if (row.teacher_name) {
            existingNames.push({ name: row.teacher_name, source: 'management_team' });
          }
        }
      }

      // Fetch from form_classes
      const { data: classesData, error: classesError } = await supabaseAdmin
        .from('form_classes')
        .select('teacher_name')
        .not('teacher_name', 'is', null)
        .neq('teacher_name', '');

      if (!classesError && classesData) {
        for (const row of classesData) {
          if (row.teacher_name) {
            existingNames.push({ name: row.teacher_name, source: 'form_classes' });
          }
        }
      }

      // Remove duplicates while preserving source info
      const uniqueNamesMap = new Map<string, { name: string; source: string }>();
      for (const item of existingNames) {
        const key = item.name.toLowerCase().trim();
        if (!uniqueNamesMap.has(key)) {
          uniqueNamesMap.set(key, item);
        }
      }

      // For substring matching - if input is contained in name or vice versa
      const inputLower = name.toLowerCase().trim();
      const substringMatches: SimilarName[] = [];
      
      for (const item of Array.from(uniqueNamesMap.values())) {
        const targetLower = item.name.toLowerCase().trim();
        
        // Exact match (case insensitive) - always 100%
        if (targetLower === inputLower) {
          substringMatches.push({ name: item.name, similarity: 100, source: item.source });
          continue;
        }
        
        // Input is contained in target or target is contained in input - always show with 100%
        if (targetLower.includes(inputLower) || inputLower.includes(targetLower)) {
          substringMatches.push({ name: item.name, similarity: 100, source: item.source });
          continue;
        }
        
        // Word-by-word matching for Malay names
        const inputWords = inputLower.split(/\s+/).filter(w => w.length > 1);
        const targetWords = targetLower.split(/\s+/).filter(w => w.length > 1);
        
        let matchedWords = 0;
        for (const iWord of inputWords) {
          for (const tWord of targetWords) {
            // Exact word match
            if (iWord === tWord) {
              matchedWords++;
              break;
            }
            // Partial match (starts with) - give full credit
            if (tWord.startsWith(iWord) || iWord.startsWith(tWord)) {
              matchedWords++;
              break;
            }
          }
        }
        
        if (matchedWords > 0) {
          const totalWords = inputWords.length + targetWords.length;
          const wordSim = Math.round((matchedWords * 2 / totalWords) * 100);
          
          // Also calculate Levenshtein for remaining
          const fullSim = calculateSimilarity(name, item.name);
          const finalSim = Math.max(wordSim, fullSim);
          
          if (finalSim >= teacherThreshold) {
            substringMatches.push({ name: item.name, similarity: finalSim, source: item.source });
          }
        }
      }

      // Sort by similarity descending, then alphabetically
      substringMatches.sort((a, b) => {
        if (b.similarity !== a.similarity) return b.similarity - a.similarity;
        return a.name.localeCompare(b.name);
      });

      const similarNames = substringMatches.slice(0, 5);

      return new Response(JSON.stringify({ similarNames }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Create new access request (for anonymous users)
    if (action === 'create') {
      if (!email || !fullName || !password) {
        return new Response(JSON.stringify({ error: 'Email, full name, and password are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (password.length < 6) {
        return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const trimmedName = fullName.trim();

      // Check if email already exists as an approved user in auth.users
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const alreadySignedUp = existingUsers?.users?.some(u => u.email === normalizedEmail);

      if (alreadySignedUp) {
        return new Response(JSON.stringify({ error: 'This email is already signed up' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if email already has a pending access request
      const { data: existingRequest } = await supabaseAdmin
        .from('pending_access_requests')
        .select('id, status')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingRequest && existingRequest.status === 'pending') {
        return new Response(JSON.stringify({ error: 'This email already has a pending request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create user in Supabase Auth with password
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: false, // User must wait for admin approval
        user_metadata: {
          full_name: trimmedName,
          role: requestType || 'teacher'
        }
      });

      if (createUserError) {
        return new Response(JSON.stringify({ error: 'Failed to create user: ' + createUserError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check for duplicate full name (block submission unless user confirms)
      if (!confirmedDuplicate) {
        const { data: duplicateRequests } = await supabaseAdmin
          .from('pending_access_requests')
          .select('id, email')
          .ilike('full_name', trimmedName)
          .neq('email', normalizedEmail);

        const hasDuplicateInRequests = duplicateRequests && duplicateRequests.length > 0;

        const nameMatch = existingUsers?.users?.some(
          u => u.user_metadata?.full_name?.toLowerCase() === trimmedName.toLowerCase()
        );

        if (hasDuplicateInRequests || nameMatch) {
          return new Response(JSON.stringify({
            requiresConfirmation: true,
            warning: 'A user with this name already exists in the system. Are you sure this is a different person?'
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      const { error } = await supabaseAdmin
        .from('pending_access_requests')
        .insert({
          email: normalizedEmail,
          full_name: trimmedName,
          request_type: requestType || 'teacher',
          status: 'pending',
          matched_teacher_name: matchedTeacherName || null
        });

      if (error) {
        if (error.code === '23505') {
          return new Response(JSON.stringify({ error: 'This email already has a pending request' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'Request submitted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: List pending requests (admin only)
    if (action === 'list') {
      const { data, error } = await supabaseAdmin
        .from('pending_access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ requests: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Approve request (admin only) - sends invite email or sends password reset if user already exists
    if (action === 'approve') {
      if (!requestId) {
        return new Response(JSON.stringify({ error: 'requestId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: request, error: requestError } = await supabaseAdmin
        .from('pending_access_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        return new Response(JSON.stringify({ error: 'Request not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find the user by email and confirm their email
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const user = existingUsers?.users?.find(u => u.email === request.email);

      if (user) {
        // Confirm user's email so they can log in
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true
        });

        // If request has matched_teacher_name, find the form_class and link to user
        if (request.matched_teacher_name) {
          const { data: formClass } = await supabaseAdmin
            .from('form_classes')
            .select('id')
            .eq('teacher_name', request.matched_teacher_name)
            .maybeSingle();

          if (formClass) {
            // Update user_roles with form_class_id
            await supabaseAdmin
              .from('user_roles')
              .upsert({
                user_id: user.id,
                role: 'teacher',
                form_class_id: formClass.id
              }, { onConflict: 'user_id' });
          }
        }
      }

      // Update request status
      await supabaseAdmin
        .from('pending_access_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          notes: notes || 'Approved'
        })
        .eq('id', requestId);

      const formClassMsg = request.matched_teacher_name ? ' (form class linked)' : ' (no form class)';
      const message = user 
        ? 'Request approved! Teacher can now log in with their password.' + formClassMsg
        : 'Request approved! (User not found in auth)';

      return new Response(JSON.stringify({ success: true, message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Reject request (admin only)
    if (action === 'reject') {
      if (!requestId) {
        return new Response(JSON.stringify({ error: 'requestId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await supabaseAdmin
        .from('pending_access_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          notes: notes || 'Rejected'
        })
        .eq('id', requestId);

      return new Response(JSON.stringify({ success: true, message: 'Request rejected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Reset user password (admin only) - No email, bypasses rate limit
    if (action === 'resetPassword') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'Password reset successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: List all users (admin only)
    if (action === 'listUsers') {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user roles from database
      const { data: roles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role');

      // Merge roles with users
      const usersWithRoles = data.users.map(user => {
        const userRole = roles?.find(r => r.user_id === user.id);
        return {
          id: user.id,
          email: user.email,
          role: userRole?.role || 'teacher',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at
        };
      });

      return new Response(JSON.stringify({ users: usersWithRoles }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Resend email (admin only) - for approved requests
    if (action === 'resend') {
      if (!requestId) {
        return new Response(JSON.stringify({ error: 'requestId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get the request
      const { data: request, error: requestError } = await supabaseAdmin
        .from('pending_access_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        return new Response(JSON.stringify({ error: 'Request not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if user already exists in auth.users
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === request.email);

      let emailSent = false;
      let emailType = '';

      if (existingUser) {
        // User already exists - send password reset email
        const emailResult = await sendEmail(
          request.email,
          'Password Reset - Kokurikulum Dashboard',
          generatePasswordResetEmailHTML(request.full_name)
        );
        
        if (emailResult.success) {
          emailSent = true;
          emailType = 'password reset';
        } else {
          return new Response(JSON.stringify({ error: 'Failed to send email: ' + emailResult.error }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        // User doesn't exist - send invite email
        const emailResult = await sendEmail(
          request.email,
          'Welcome to Kokurikulum Dashboard!',
          generateInviteEmailHTML(request.full_name, request.request_type || 'teacher')
        );

        if (emailResult.success) {
          emailSent = true;
          emailType = 'invite';
        } else {
          return new Response(JSON.stringify({ error: 'Failed to send email: ' + emailResult.error }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `${emailType === 'invite' ? 'Invite' : 'Password reset'} email resent successfully` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Get pending role assignments (admin only) - approved teachers without any school assignments
    if (action === 'pendingRoleAssignments') {
      console.log('pendingRoleAssignments: Starting query...');
      
      const { data: approvedRequests, error: requestsError } = await supabaseAdmin
        .from('pending_access_requests')
        .select('id, full_name, email, status, reviewed_at, matched_teacher_name')
        .eq('status', 'approved')
        .order('reviewed_at', { ascending: false });

      console.log('pendingRoleAssignments: approvedRequests:', approvedRequests, 'error:', requestsError);

      if (requestsError) {
        return new Response(JSON.stringify({ error: requestsError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: managementTeam, error: mtError } = await supabaseAdmin
        .from('management_team')
        .select('teacher_name');

      console.log('pendingRoleAssignments: managementTeam:', managementTeam?.length, 'error:', mtError);

      if (mtError) {
        return new Response(JSON.stringify({ error: mtError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: formClasses, error: fcError } = await supabaseAdmin
        .from('form_classes')
        .select('teacher_name');

      console.log('pendingRoleAssignments: formClasses:', formClasses?.length, 'error:', fcError);

      if (fcError) {
        return new Response(JSON.stringify({ error: fcError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: kokurikulumUnits, error: kuError } = await supabaseAdmin
        .from('kokurikulum_units')
        .select('chief_teacher, advisors');

      console.log('pendingRoleAssignments: kokurikulumUnits:', kokurikulumUnits?.length, 'error:', kuError);

      if (kuError) {
        return new Response(JSON.stringify({ error: kuError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const assignedNames = new Set<string>();
      managementTeam?.forEach(m => { if (m.teacher_name) assignedNames.add(m.teacher_name.toLowerCase()); });
      formClasses?.forEach(fc => { if (fc.teacher_name) assignedNames.add(fc.teacher_name.toLowerCase()); });
      kokurikulumUnits?.forEach(ku => {
        if (ku.chief_teacher) assignedNames.add(ku.chief_teacher.toLowerCase());
        if (ku.advisors) {
          console.log('pendingRoleAssignments: ku.advisors type:', typeof ku.advisors, 'value:', ku.advisors);
          if (Array.isArray(ku.advisors)) {
            ku.advisors.forEach((adv: string) => assignedNames.add(adv.toLowerCase()));
          }
        }
      });

      console.log('pendingRoleAssignments: assignedNames:', Array.from(assignedNames));

      const pendingAssignments = approvedRequests?.filter(req => {
        const name = req.full_name?.toLowerCase();
        const matchedName = req.matched_teacher_name?.toLowerCase();
        const isAssigned = assignedNames.has(name) || assignedNames.has(matchedName);
        console.log('pendingRoleAssignments: checking req:', req.full_name, 'name in set:', assignedNames.has(name), 'matchedName in set:', matchedName ? assignedNames.has(matchedName) : 'no matchedName');
        return !isAssigned;
      }) || [];

      console.log('pendingRoleAssignments: pendingAssignments:', pendingAssignments);

      return new Response(JSON.stringify({ requests: pendingAssignments, debug: { approvedCount: approvedRequests?.length, assignedNamesCount: assignedNames.size } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action: ' + action }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
