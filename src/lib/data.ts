
import type { Service, Staff, Location, AdminUser, Booking, ClientLoyalty, NewBooking } from './types';

// --- DUMMY DATA STORE ---
// We use a singleton pattern to simulate a database in memory.
const createDataStore = () => {
    let DUMMY_LOCATIONS: Location[] = [
      { id: 'loc_1', name: 'Downtown Barbers', address: '123 Main St, Anytown, USA', phone: '555-1234', email: 'contact@downtown.co' },
      { id: 'loc_2', name: 'Uptown Cuts', address: '456 Oak Ave, Anytown, USA', phone: '555-5678', email: 'contact@uptown.co' },
    ];

    let DUMMY_SERVICES: Service[] = [
      { id: 'serv_1', name: 'Classic Haircut', duration: 45, price: 30, locationId: 'loc_1', locationName: 'Downtown Barbers' },
      { id: 'serv_2', name: 'Beard Trim', duration: 20, price: 15, locationId: 'loc_1', locationName: 'Downtown Barbers' },
      { id: 'serv_3', name: 'Hot Towel Shave', duration: 30, price: 25, locationId: 'loc_1', locationName: 'Downtown Barbers' },
      { id: 'serv_4', name: 'Modern Fade', duration: 60, price: 40, locationId: 'loc_2', locationName: 'Uptown Cuts' },
      { id: 'serv_5', name: 'Coloring', duration: 90, price: 75, locationId: 'loc_2', locationName: 'Uptown Cuts' },
    ];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 30, 0, 0);

    let DUMMY_STAFF: Staff[] = [
      {
        id: 'staff_1', name: 'Alice', specialization: 'Master Barber', locationId: 'loc_1', locationName: 'Downtown Barbers', email: 'staff@example.com',
        imageUrl: `https://i.pravatar.cc/100?u=staff_1`,
        workingHours: { monday: { start: '09:00', end: '17:00' }, tuesday: { start: '09:00', end: '17:00' }, wednesday: 'off', thursday: { start: '10:00', end: '18:00' }, friday: { start: '09:00', end: '17:00' }, saturday: 'off', sunday: 'off' },
      },
      {
        id: 'staff_2', name: 'Bob', specialization: 'Stylist', locationId: 'loc_2', locationName: 'Uptown Cuts', email: 'bob@example.com',
        imageUrl: `https://i.pravatar.cc/100?u=staff_2`,
        workingHours: { monday: 'off', tuesday: { start: '09:00', end: '17:00' }, wednesday: { start: '09:00', end: '17:00' }, thursday: { start: '11:00', end: '19:00' }, friday: { start: '09:00', end: '17:00' }, saturday: { start: '10:00', end: '14:00' }, sunday: 'off' },
      },
       {
        id: 'branch_admin_user', name: 'Charlie', specialization: 'Senior Stylist', locationId: 'loc_2', locationName: 'Uptown Cuts', email: 'branchadmin@example.com',
        imageUrl: `https://i.pravatar.cc/100?u=branch_admin_user`,
        workingHours: { monday: { start: '09:00', end: '17:00' }, tuesday: { start: '09:00', end: '17:00' }, wednesday: { start: '09:00', end: '17:00' }, thursday: { start: '09:00', end: '17:00' }, friday: { start: '09:00', end: '17:00' }, saturday: 'off', sunday: 'off' },
      },
      {
        id: 'super_admin_user', name: 'Samantha (Owner)', specialization: 'Super Admin', locationId: 'loc_1', locationName: 'Downtown Barbers', email: 'superadmin@example.com',
        imageUrl: `https://i.pravatar.cc/100?u=super_admin_user`,
        workingHours: { monday: { start: '09:00', end: '17:00' }, tuesday: { start: '09:00', end: '17:00' }, wednesday: { start: '09:00', end: '17:00' }, thursday: { start: '09:00', end: '17:00' }, friday: { start: '09:00', end: '17:00' }, saturday: 'off', sunday: 'off' },
      }
    ];

    let DUMMY_ADMIN_USERS: AdminUser[] = [
        { id: 'super_admin_user', email: 'superadmin@example.com', locationName: 'All Locations' },
        { id: 'branch_admin_user', email: 'branchadmin@example.com', locationId: 'loc_2', locationName: 'Uptown Cuts' },
    ];
    
    let DUMMY_BOOKINGS: Booking[] = [
      { 
        id: 'booking_1', locationId: 'loc_1', locationName: 'Downtown Barbers', serviceId: 'serv_1', serviceName: 'Classic Haircut', servicePrice: 30, serviceDuration: 45, 
        staffId: 'staff_1', staffName: 'Alice', staffImageUrl: `https://i.pravatar.cc/100?u=staff_1`,
        bookingTimestamp: tomorrow.toISOString(),
        clientName: 'John Doe', clientPhone: '111-222-3333', clientEmail: 'john@doe.com',
      },
      { 
        id: 'booking_2', locationId: 'loc_2', locationName: 'Uptown Cuts', serviceId: 'serv_4', serviceName: 'Modern Fade', servicePrice: 40, serviceDuration: 60,
        staffId: 'staff_2', staffName: 'Bob', staffImageUrl: `https://i.pravatar.cc/100?u=staff_2`,
        bookingTimestamp: dayAfter.toISOString(),
        clientName: 'Jane Smith', clientPhone: '444-555-6666', clientEmail: 'jane@smith.com',
      }
    ];

    return {
        // Locations
        getLocations: async (id?: string) => id ? DUMMY_LOCATIONS.filter(l => l.id === id) : DUMMY_LOCATIONS.sort((a,b) => a.name.localeCompare(b.name)),
        addLocation: async (data: Omit<Location, 'id'>) => {
            const newLocation = { id: `loc_${Date.now()}`, ...data };
            DUMMY_LOCATIONS.push(newLocation);
        },
        updateLocation: async (id: string, data: Partial<Location>) => {
            DUMMY_LOCATIONS = DUMMY_LOCATIONS.map(l => l.id === id ? { ...l, ...data } : l);
        },
        deleteLocation: async (id: string) => {
            DUMMY_LOCATIONS = DUMMY_LOCATIONS.filter(l => l.id !== id);
        },

        // Services
        getServices: async (locationId?: string) => {
            const services = locationId ? DUMMY_SERVICES.filter(s => s.locationId === locationId) : DUMMY_SERVICES;
            return services.sort((a,b) => a.name.localeCompare(b.name));
        },
        addService: async (data: Omit<Service, 'id'>) => {
            const newService = { id: `serv_${Date.now()}`, ...data };
            DUMMY_SERVICES.push(newService);
        },
        updateService: async (id: string, data: Partial<Service>) => {
            DUMMY_SERVICES = DUMMY_SERVICES.map(s => s.id === id ? { ...s, ...data } : s);
        },
        deleteService: async (id: string) => {
            DUMMY_SERVICES = DUMMY_SERVICES.filter(s => s.id !== id);
        },

        // Staff
        getStaff: async (locationId?: string) => {
            const staff = locationId ? DUMMY_STAFF.filter(s => s.locationId === locationId) : DUMMY_STAFF;
            return staff.sort((a,b) => a.name.localeCompare(b.name));
        },
        getStaffByEmail: async (email: string) => DUMMY_STAFF.find(s => s.email === email) || null,
        addStaff: async (data: Staff) => {
            DUMMY_STAFF.push(data);
        },
        updateStaff: async (id: string, data: Partial<Staff>) => {
            DUMMY_STAFF = DUMMY_STAFF.map(s => s.id === id ? { ...s, ...data } : s);
        },
        deleteStaff: async (id: string) => {
            DUMMY_STAFF = DUMMY_STAFF.filter(s => s.id !== id);
        },
        
        // Admins
        getAdmins: async (locationId?: string) => {
            const admins = locationId ? DUMMY_ADMIN_USERS.filter(a => a.locationId === locationId) : DUMMY_ADMIN_USERS;
            return admins.sort((a,b) => a.email.localeCompare(b.email));
        },
        getAdminUserByEmail: async (email: string) => DUMMY_ADMIN_USERS.find(u => u.email === email) || null,
        addAdmin: async (data: AdminUser) => {
            DUMMY_ADMIN_USERS.push(data);
        },
        updateAdmin: async (id: string, data: Partial<AdminUser>) => {
            DUMMY_ADMIN_USERS = DUMMY_ADMIN_USERS.map(a => a.id === id ? { ...a, ...data } : a);
        },
        deleteAdmin: async (id: string) => {
            DUMMY_ADMIN_USERS = DUMMY_ADMIN_USERS.filter(a => a.id !== id);
        },
        
        // Bookings
        getBookings: async (locationId?: string) => {
             const upcoming = DUMMY_BOOKINGS.filter(b => new Date(b.bookingTimestamp) >= new Date());
             const bookings = locationId ? upcoming.filter(b => b.locationId === locationId) : upcoming;
             return bookings.sort((a,b) => new Date(a.bookingTimestamp).getTime() - new Date(b.bookingTimestamp).getTime());
        },
        getBookingsByPhone: async (phone: string) => DUMMY_BOOKINGS.filter(b => b.clientPhone === phone).sort((a,b) => new Date(b.bookingTimestamp).getTime() - new Date(a.bookingTimestamp).getTime()),
        getBookingsByStaffId: async (staffId: string) => DUMMY_BOOKINGS.filter(b => b.staffId === staffId).sort((a,b) => new Date(b.bookingTimestamp).getTime() - new Date(a.bookingTimestamp).getTime()),
        addBooking: async (data: NewBooking) => {
            const newBooking = { id: `booking_${Date.now()}`, ...data };
            DUMMY_BOOKINGS.push(newBooking);
        },
        deleteBooking: async (id: string) => {
            DUMMY_BOOKINGS = DUMMY_BOOKINGS.filter(b => b.id !== id);
        },

        // Client Loyalty
        getClientLoyaltyData: async (locationId?: string) => {
            const clientsMap = new Map<string, ClientLoyalty>();

            const bookingsToProcess = locationId ? DUMMY_BOOKINGS.filter(b => b.locationId === locationId) : DUMMY_BOOKINGS;

            bookingsToProcess.forEach(booking => {
                if (!booking.clientPhone || booking.clientPhone.trim() === '') return;
                const clientIdentifier = `${booking.clientName.toLowerCase().trim()}-${booking.clientPhone.trim()}`;

                if (clientsMap.has(clientIdentifier)) {
                    const existingClient = clientsMap.get(clientIdentifier)!;
                    existingClient.totalVisits += 1;
                    if (new Date(booking.bookingTimestamp) > new Date(existingClient.lastVisit)) {
                        existingClient.lastVisit = booking.bookingTimestamp;
                    }
                    if (!existingClient.locations.includes(booking.locationName)) {
                        existingClient.locations.push(booking.locationName);
                    }
                } else {
                     clientsMap.set(clientIdentifier, {
                        id: clientIdentifier,
                        name: booking.clientName,
                        phone: booking.clientPhone,
                        email: booking.clientEmail,
                        totalVisits: 1,
                        lastVisit: booking.bookingTimestamp,
                        locations: [booking.locationName],
                     });
                }
            });

            return Array.from(clientsMap.values()).sort((a, b) => b.totalVisits - a.totalVisits);
        }
    };
};

// Export singleton instance of the data store functions
const dataStore = createDataStore();
export const {
    getLocations, addLocation, updateLocation, deleteLocation,
    getServices, addService, updateService, deleteService,
    getStaff, getStaffByEmail, addStaff, updateStaff, deleteStaff,
    getAdmins, getAdminUserByEmail, addAdmin, updateAdmin, deleteAdmin,
    getBookings, getBookingsByPhone, getBookingsByStaffId, addBooking, deleteBooking,
    getClientLoyaltyData
} = dataStore;
