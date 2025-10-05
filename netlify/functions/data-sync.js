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
        const { token, action, data } = JSON.parse(event.body);

        console.log('[DataSync] Request:', { action, dataLength: data ? data.length : 0 });

        if (!token) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Authentication token is required' })
            };
        }

        if (!action) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Action is required' })
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

            case 'save_user_state':
                return await saveUserState(user.id, data, headers);

            case 'get_user_state':
                return await getUserState(user.id, headers);

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid action specified' })
                };
        }

    } catch (error) {
        console.error('Data sync error:', error);

        // Provide more specific error information
        let errorMessage = 'Internal server error during data sync';
        if (error.message) {
            errorMessage = error.message;
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: errorMessage,
                details: error.details || error.hint || null
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
            const contactsToInsert = contacts.map(contact => {
                // Map frontend fields to database schema
                const mappedContact = {
                    user_id: userId,
                    contact_name: contact.contactName || contact.contact_name || '',
                    firm: contact.firm || '',
                    email: contact.email || '',
                    country: contact.country || '',
                    category: contact.category || '',
                    status: contact.emailStatus || contact.status || 'pending',
                    source_file: contact.source || contact.source_file || '',
                    created_at: contact.created_at || new Date().toISOString()
                };

                // Store additional fields (phone, website, address, businessFocus, marketStrength) in additional_data JSONB
                const additionalData = {};
                if (contact.phone) additionalData.phone = contact.phone;
                if (contact.website) additionalData.website = contact.website;
                if (contact.address) additionalData.address = contact.address;
                if (contact.businessFocus) additionalData.businessFocus = contact.businessFocus;
                if (contact.marketStrength) additionalData.marketStrength = contact.marketStrength;

                if (Object.keys(additionalData).length > 0) {
                    mappedContact.additional_data = additionalData;
                }

                return mappedContact;
            });

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
        console.log('[SaveCompanies] Starting save for user:', userId);
        console.log('[SaveCompanies] Companies data:', companies ? companies.length : 0, 'items');

        // Delete existing companies for this user
        const { error: deleteError } = await supabase
            .from('companies')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            console.error('[SaveCompanies] Delete error:', deleteError);
            throw deleteError;
        }

        // Insert new companies
        if (companies && companies.length > 0) {
            const companiesToInsert = companies.map(company => {
                // Core fields that map directly to database columns
                const coreFields = {
                    id: company.id || company.companyId,
                    user_id: userId,
                    company_name: company.companyName || '',
                    company_email: company.companyEmail || '',
                    company_phone: company.companyPhone || '',
                    company_website: company.companyWebsite || '',
                    company_address: company.companyAddress || '',
                    company_industry: company.companyIndustry || '',
                    company_years: company.companyYears ? parseInt(company.companyYears) : null,
                    company_description: company.companyDescription || '',
                    is_active: company.isActive !== undefined ? company.isActive : true,
                    is_default: company.isDefault || false,
                    created_at: company.createdAt || company.created_at || new Date().toISOString(),
                    updated_at: company.updatedAt || company.updated_at || new Date().toISOString()
                };

                // All additional fields go into additional_data JSONB
                const additionalData = {
                    companyLogo: company.companyLogo || '',
                    companyShortName: company.companyShortName || '',
                    businesDevelopementManagerName: company.businesDevelopementManagerName || '',
                    businesDevelopementManagerDesignation: company.businesDevelopementManagerDesignation || '',
                    productPortfolioPoints: company.productPortfolioPoints || '',
                    OfferingPoints: company.OfferingPoints || '',
                    Link1: company.Link1 || '',
                    Link2: company.Link2 || '',
                    Link3: company.Link3 || '',
                    Image1: company.Image1 || '',
                    Image2: company.Image2 || '',
                    emailTemplate: company.emailTemplate || '',
                    companyZohoEmail: company.companyZohoEmail || '',
                    companyZohoPassword: company.companyZohoPassword || '',
                    companySenderName: company.companySenderName || '',
                    companyEmailEnabled: company.companyEmailEnabled || false,
                    companyEmailJSService: company.companyEmailJSService || '',
                    companyEmailJSTemplate: company.companyEmailJSTemplate || '',
                    // Metadata
                    ownerId: company.ownerId || null,
                    lastModified: company.lastModified || new Date().toISOString(),
                    dataVersion: company.dataVersion || '1.0'
                };

                // Only include non-empty additional data
                if (Object.keys(additionalData).some(key => additionalData[key])) {
                    coreFields.additional_data = additionalData;
                }

                return coreFields;
            });

            console.log('[SaveCompanies] Inserting companies:', companiesToInsert.length);

            const { error } = await supabase
                .from('companies')
                .insert(companiesToInsert);

            if (error) {
                console.error('[SaveCompanies] Insert error:', error);
                throw error;
            }
        } else {
            console.log('[SaveCompanies] No companies to save');
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
        const { data: contactsRaw } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // Map database fields back to frontend format
        const contacts = contactsRaw ? contactsRaw.map(contact => ({
            contactName: contact.contact_name || 'Contact Person',
            firm: contact.firm || 'Unknown Company',
            email: contact.email || '',
            country: contact.country || 'Unknown',
            category: contact.category || 'General',
            emailStatus: contact.status || 'pending',
            source: contact.source_file || 'Database',
            // Extract additional fields from JSONB
            phone: contact.additional_data?.phone || '',
            website: contact.additional_data?.website || '',
            address: contact.additional_data?.address || '',
            // Add missing frontend fields that are expected
            businessFocus: contact.additional_data?.businessFocus || generateBusinessFocus(contact.category || 'General'),
            marketStrength: contact.additional_data?.marketStrength || 'Medium',
            created_at: contact.created_at
        })) : [];

        // Helper function to generate business focus
        function generateBusinessFocus(category) {
            const focusMap = {
                'Technology': 'Innovation & Digital Solutions',
                'Manufacturing': 'Production & Supply Chain',
                'Healthcare': 'Patient Care & Medical Services',
                'Finance': 'Financial Services & Investment',
                'Education': 'Learning & Development',
                'Retail': 'Customer Experience & Sales',
                'General': 'Business Growth & Expansion'
            };
            return focusMap[category] || 'Business Growth & Expansion';
        }

        const { data: companiesRaw } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false});

        // Map database fields back to frontend format
        const companies = companiesRaw ? companiesRaw.map(company => ({
            id: company.id,
            companyId: company.id, // Backward compatibility
            companyName: company.company_name || '',
            companyEmail: company.company_email || '',
            companyPhone: company.company_phone || '',
            companyWebsite: company.company_website || '',
            companyAddress: company.company_address || '',
            companyIndustry: company.company_industry || '',
            companyYears: company.company_years?.toString() || '',
            companyDescription: company.company_description || '',
            isActive: company.is_active !== undefined ? company.is_active : true,
            isDefault: company.is_default || false,
            createdAt: company.created_at,
            updatedAt: company.updated_at,
            // Extract additional fields from JSONB
            companyLogo: company.additional_data?.companyLogo || '',
            companyShortName: company.additional_data?.companyShortName || '',
            businesDevelopementManagerName: company.additional_data?.businesDevelopementManagerName || '',
            businesDevelopementManagerDesignation: company.additional_data?.businesDevelopementManagerDesignation || '',
            productPortfolioPoints: company.additional_data?.productPortfolioPoints || '',
            OfferingPoints: company.additional_data?.OfferingPoints || '',
            Link1: company.additional_data?.Link1 || '',
            Link2: company.additional_data?.Link2 || '',
            Link3: company.additional_data?.Link3 || '',
            Image1: company.additional_data?.Image1 || '',
            Image2: company.additional_data?.Image2 || '',
            emailTemplate: company.additional_data?.emailTemplate || '',
            companyZohoEmail: company.additional_data?.companyZohoEmail || '',
            companyZohoPassword: company.additional_data?.companyZohoPassword || '',
            companySenderName: company.additional_data?.companySenderName || '',
            companyEmailEnabled: company.additional_data?.companyEmailEnabled || false,
            companyEmailJSService: company.additional_data?.companyEmailJSService || '',
            companyEmailJSTemplate: company.additional_data?.companyEmailJSTemplate || '',
            ownerId: company.additional_data?.ownerId || null,
            lastModified: company.additional_data?.lastModified || company.updated_at,
            dataVersion: company.additional_data?.dataVersion || '1.0'
        })) : [];

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

async function saveUserState(userId, state, headers) {
    try {
        console.log('[UserState] Saving comprehensive user state for user:', userId);

        // Check if user_state table entry exists
        const { data: existingState } = await supabase
            .from('user_state')
            .select('id')
            .eq('user_id', userId)
            .single();

        const stateData = {
            user_id: userId,
            state_data: state,
            updated_at: new Date().toISOString()
        };

        let result;
        if (existingState) {
            // Update existing state
            result = await supabase
                .from('user_state')
                .update(stateData)
                .eq('user_id', userId);
        } else {
            // Insert new state
            stateData.created_at = new Date().toISOString();
            result = await supabase
                .from('user_state')
                .insert([stateData]);
        }

        if (result.error) {
            console.error('[UserState] Database error:', result.error);
            throw result.error;
        }

        console.log('[UserState] User state saved successfully');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'User state saved successfully'
            })
        };
    } catch (error) {
        console.error('Save user state error:', error);
        throw error;
    }
}

async function getUserState(userId, headers) {
    try {
        console.log('[UserState] Getting user state for user:', userId);

        const { data: userState, error } = await supabase
            .from('user_state')
            .select('state_data, updated_at')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('[UserState] Database error:', error);
            throw error;
        }

        if (!userState) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    state: null,
                    message: 'No user state found'
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                state: userState.state_data,
                lastUpdated: userState.updated_at
            })
        };
    } catch (error) {
        console.error('Get user state error:', error);
        throw error;
    }
}