// Netlify Function for syncing user data (contacts, companies, email history)
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to verify user authentication
async function verifyUser(token) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        throw new Error('Invalid or expired session token');
    }
    return user;
}

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, PUT, GET, DELETE, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { token, action, dataType, data } = JSON.parse(event.body);

        if (!token) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Authentication token is required' })
            };
        }

        // Verify user authentication
        const user = await verifyUser(token);

        switch (action) {
            case 'save_contacts':
                return await saveContacts(user.id, data, headers);

            case 'save_companies':
                return await saveCompanies(user.id, data, headers);

            case 'save_email_history':
                return await saveEmailHistory(user.id, data, headers);

            case 'get_all_data':
                return await getAllUserData(user.id, headers);

            case 'save_all_data':
                return await saveAllUserData(user.id, data, headers);

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid action specified' })
                };
        }

    } catch (error) {
        console.error('Data sync error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error during data sync'
            })
        };
    }
};

async function saveContacts(userId, contacts, headers) {
    try {
        // Delete existing contacts for this user
        await supabase
            .from('contacts')
            .delete()
            .eq('user_id', userId);

        // Insert new contacts
        if (contacts && contacts.length > 0) {
            const contactsToInsert = contacts.map(contact => ({
                ...contact,
                user_id: userId,
                created_at: contact.created_at || new Date().toISOString()
            }));

            const { error } = await supabase
                .from('contacts')
                .insert(contactsToInsert);

            if (error) throw error;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Contacts saved successfully',
                count: contacts ? contacts.length : 0
            })
        };
    } catch (error) {
        console.error('Save contacts error:', error);
        throw error;
    }
}

async function saveCompanies(userId, companies, headers) {
    try {
        // Delete existing companies for this user
        await supabase
            .from('companies')
            .delete()
            .eq('user_id', userId);

        // Insert new companies
        if (companies && companies.length > 0) {
            const companiesToInsert = companies.map(company => ({
                ...company,
                user_id: userId,
                created_at: company.created_at || new Date().toISOString()
            }));

            const { error } = await supabase
                .from('companies')
                .insert(companiesToInsert);

            if (error) throw error;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Companies saved successfully',
                count: companies ? companies.length : 0
            })
        };
    } catch (error) {
        console.error('Save companies error:', error);
        throw error;
    }
}

async function saveEmailHistory(userId, emailHistory, headers) {
    try {
        // Delete existing email history for this user
        await supabase
            .from('email_history')
            .delete()
            .eq('user_id', userId);

        // Insert new email history
        if (emailHistory && emailHistory.length > 0) {
            const historyToInsert = emailHistory.map(item => ({
                ...item,
                user_id: userId,
                created_at: item.created_at || new Date().toISOString()
            }));

            const { error } = await supabase
                .from('email_history')
                .insert(historyToInsert);

            if (error) throw error;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Email history saved successfully',
                count: emailHistory ? emailHistory.length : 0
            })
        };
    } catch (error) {
        console.error('Save email history error:', error);
        throw error;
    }
}

async function getAllUserData(userId, headers) {
    try {
        const { data: contacts } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        const { data: emailHistory } = await supabase
            .from('email_history')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    contacts: contacts || [],
                    companies: companies || [],
                    emailHistory: emailHistory || []
                }
            })
        };
    } catch (error) {
        console.error('Get all data error:', error);
        throw error;
    }
}

async function saveAllUserData(userId, data, headers) {
    try {
        // Save all data types
        const results = {};

        if (data.contacts) {
            await saveContacts(userId, data.contacts, headers);
            results.contacts = data.contacts.length;
        }

        if (data.companies) {
            await saveCompanies(userId, data.companies, headers);
            results.companies = data.companies.length;
        }

        if (data.emailHistory) {
            await saveEmailHistory(userId, data.emailHistory, headers);
            results.emailHistory = data.emailHistory.length;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'All user data saved successfully',
                results: results
            })
        };
    } catch (error) {
        console.error('Save all data error:', error);
        throw error;
    }
}