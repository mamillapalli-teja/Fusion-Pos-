
import React, { useState, useEffect } from 'react';
import { DispatchType, DeliveryAddress, Customer } from '../../types';
import { Icon } from '../shared/Icon';
import { GoogleGenAI } from "@google/genai";

interface DispatchDetailsModalProps {
  dispatchType: DispatchType;
  customers: Customer[];
  onConfirm: (details: {
    tableNumber?: number;
    numberOfGuests?: number;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: DeliveryAddress;
  }) => void;
  onCancel: () => void;
  initialDetails?: {
    tableNumber?: number;
    numberOfGuests?: number;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: DeliveryAddress;
  };
}

export const DispatchDetailsModal: React.FC<DispatchDetailsModalProps> = ({ dispatchType, customers, onConfirm, onCancel, initialDetails }) => {
  // Dine In State
  const [tableNumber, setTableNumber] = useState(initialDetails?.tableNumber?.toString() || '');
  const [guests, setGuests] = useState(initialDetails?.numberOfGuests?.toString() || '');

  // Takeaway/Collection/Delivery State
  const [name, setName] = useState(initialDetails?.customerName || '');
  const [phone, setPhone] = useState(initialDetails?.customerPhone || '');
  
  // CRM State
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);

  // Delivery State
  const [eircode, setEircode] = useState(initialDetails?.deliveryAddress?.eircode || '');
  const [addressLine1, setAddressLine1] = useState(initialDetails?.deliveryAddress?.line1 || '');
  const [addressLine2, setAddressLine2] = useState(initialDetails?.deliveryAddress?.line2 || '');
  const [city, setCity] = useState(initialDetails?.deliveryAddress?.city || '');
  const [isSearching, setIsSearching] = useState(false);
  const [mapLinks, setMapLinks] = useState<{title: string, uri: string}[]>([]);
  
  // Validation Error
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    setValidationError(null);

    // CRM Lookup by Phone
    const customer = customers.find(c => c.phone === val.trim());
    if (customer) {
        autoFillFromCustomer(customer);
    } else {
        setFoundCustomer(null);
    }
  };

  const autoFillFromCustomer = (customer: Customer) => {
    setFoundCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone);
    if (dispatchType === DispatchType.DELIVERY && customer.addresses && customer.addresses.length > 0) {
        const addr = customer.addresses[0];
        setEircode(addr.eircode);
        setAddressLine1(addr.line1);
        setAddressLine2(addr.line2 || '');
        setCity(addr.city);
    }
  };

  const handleEircodeLookup = async () => {
    const cleanCode = eircode.replace(/\s/g, '').toUpperCase();
    if (!cleanCode || cleanCode.length < 3) return;
    
    setIsSearching(true);
    setValidationError(null);
    setMapLinks([]);

    // 1. Check local CRM first for this Eircode
    const crmMatch = customers.find(c => c.addresses.some(a => a.eircode.replace(/\s/g, '').toUpperCase() === cleanCode));
    if (crmMatch) {
        autoFillFromCustomer(crmMatch);
        setIsSearching(false);
        return;
    }

    // 2. Google Maps Grounding via Gemini API
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        let userLocation = null;
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
            });
            userLocation = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
        } catch (e) {
            console.warn("Geolocation denied or timed out");
        }

        const prompt = `Resolve the Irish Eircode or Address "${eircode}" into a JSON-like format with: House Number, Street Name, Area, City, and County. Be precise.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite-latest",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                ...(userLocation && {
                    toolConfig: {
                        retrievalConfig: {
                            latLng: userLocation
                        }
                    }
                })
            },
        });

        const text = response.text || "";
        
        // Extract grounding chunks for UI links
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            const links = chunks
                .filter(c => c.maps)
                .map(c => ({ title: c.maps.title, uri: c.maps.uri }));
            setMapLinks(links);
        }

        // Basic heuristic parsing of the response text (LLM output)
        const lines = text.split('\n');
        let newAddr1 = '';
        let newCity = '';
        
        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (lower.includes('house') || lower.includes('street') || lower.includes('address line 1')) {
                newAddr1 = line.split(':')[1]?.trim() || newAddr1;
            }
            if (lower.includes('city') || lower.includes('town')) {
                newCity = line.split(':')[1]?.trim() || newCity;
            }
        });

        if (newAddr1) setAddressLine1(newAddr1.replace(/["',]/g, ''));
        if (newCity) setCity(newCity.replace(/["',]/g, ''));

    } catch (error) {
        console.error("AI Lookup failed", error);
        setValidationError("Could not resolve address automatically. Please enter manually.");
    } finally {
        setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    const details: any = {};
    setValidationError(null);

    if (dispatchType === DispatchType.DINE_IN) {
      if (!tableNumber.trim()) {
        setValidationError('Table number is required.');
        return;
      }
      details.tableNumber = parseInt(tableNumber, 10);
      details.numberOfGuests = parseInt(guests, 10) || 1;
    } else if (dispatchType === DispatchType.TAKE_OUT || dispatchType === DispatchType.COLLECTION) {
      if (!name.trim()) {
        setValidationError('Customer name is required.');
        return;
      }
      details.customerName = name;
      details.customerPhone = phone;
    } else if (dispatchType === DispatchType.DELIVERY) {
      if (!eircode.trim() || !addressLine1.trim() || !city.trim() || !name.trim()) {
        setValidationError('Please complete all required delivery fields.');
        return;
      }

      details.deliveryAddress = {
        eircode: eircode.toUpperCase(),
        line1: addressLine1,
        line2: addressLine2,
        city
      };
      details.customerName = name;
      details.customerPhone = phone;
    }

    onConfirm(details);
  };

  const renderCRMCard = () => {
    if (!foundCustomer) return null;
    return (
        <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-2xl p-4 mb-4 animate-in fade-in zoom-in duration-300 shadow-inner">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-brand-primary rounded-full p-1.5 shadow-lg shadow-brand-primary/20">
                        <Icon className="w-4 h-4 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Icon>
                    </div>
                    <span className="font-black text-brand-primary uppercase text-xs tracking-widest">Returning Customer</span>
                </div>
                <button onClick={() => setFoundCustomer(null)} className="text-[10px] font-bold text-medium-text hover:text-red-400 uppercase">Clear</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-dark-card/50 p-2 rounded-xl border border-dark-border/50 text-center">
                    <p className="text-[9px] text-medium-text font-bold uppercase">Orders</p>
                    <p className="font-black text-light-text text-base">{foundCustomer.totalOrders}</p>
                </div>
                <div className="bg-dark-card/50 p-2 rounded-xl border border-dark-border/50 text-center">
                    <p className="text-[9px] text-medium-text font-bold uppercase">LTV</p>
                    <p className="font-black text-light-text text-base">${foundCustomer.totalSpent.toFixed(0)}</p>
                </div>
                <div className="bg-dark-card/50 p-2 rounded-xl border border-dark-border/50 text-center">
                    <p className="text-[9px] text-medium-text font-bold uppercase">Last Order</p>
                    <p className="font-black text-light-text text-[10px] leading-tight mt-1">
                        {foundCustomer.lastOrderDate ? foundCustomer.lastOrderDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-dark-card rounded-3xl shadow-2xl w-full max-w-md border border-dark-border flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-5 bg-dark-bg/50 border-b border-dark-border flex justify-between items-center">
            <h3 className="text-xl font-black text-light-text flex items-center gap-3 tracking-tight">
                <div className="bg-brand-primary/10 p-2 rounded-xl">
                    <Icon className="w-5 h-5 text-brand-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </Icon>
                </div>
                {dispatchType} Details
            </h3>
            <button onClick={onCancel} className="p-2 hover:bg-dark-border rounded-full text-medium-text transition-colors">
                <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {validationError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider animate-in slide-in-from-top-2">
                {validationError}
              </div>
            )}

            <div className="space-y-5">
                {/* Dynamic Content Based on Dispatch */}
                {dispatchType === DispatchType.DINE_IN ? (
                    <div className="animate-in slide-in-from-bottom-4 duration-300">
                        <div className="mb-6">
                            <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em]">Table Number <span className="text-red-400">*</span></label>
                            <input
                                type="number"
                                autoFocus
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-2xl p-4 text-light-text focus:ring-2 focus:ring-brand-primary outline-none text-2xl font-black shadow-inner"
                                placeholder="00"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em]">Number of Guests</label>
                            <input
                                type="number"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-2xl p-4 text-light-text focus:ring-2 focus:ring-brand-primary outline-none text-2xl font-black shadow-inner"
                                placeholder="1"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary mb-2 uppercase tracking-[0.2em]">Phone Number</label>
                                <input
                                    type="tel"
                                    autoFocus
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="w-full bg-dark-bg border border-dark-border rounded-2xl p-4 text-light-text focus:ring-2 focus:ring-brand-primary outline-none text-lg font-bold shadow-inner"
                                    placeholder="08X XXX XXXX"
                                />
                            </div>
                            
                            {renderCRMCard()}

                            <div>
                                <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em]">Customer Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-dark-bg border border-dark-border rounded-2xl p-4 text-light-text focus:ring-2 focus:ring-brand-primary outline-none font-bold shadow-inner"
                                    placeholder="Jane Doe"
                                />
                            </div>
                        </div>

                        {dispatchType === DispatchType.DELIVERY && (
                            <div className="pt-4 border-t border-dark-border/50 space-y-4">
                                <div className="bg-brand-primary/5 p-4 rounded-3xl border border-brand-primary/10">
                                    <label className="block text-[10px] font-black text-brand-primary mb-2 uppercase tracking-[0.2em]">Eircode / Postcode</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={eircode}
                                            onChange={(e) => setEircode(e.target.value)}
                                            className="flex-1 bg-dark-bg border border-dark-border rounded-2xl p-4 text-light-text focus:ring-2 focus:ring-brand-primary outline-none uppercase font-black tracking-widest text-lg shadow-inner"
                                            placeholder="D02 X999"
                                        />
                                        <button 
                                            onClick={handleEircodeLookup}
                                            disabled={isSearching || !eircode}
                                            className="bg-brand-primary text-white w-14 rounded-2xl font-black hover:bg-brand-secondary transition-all disabled:opacity-30 flex items-center justify-center shadow-lg shadow-brand-primary/20 active:scale-95"
                                        >
                                            {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></Icon>}
                                        </button>
                                    </div>
                                    {mapLinks.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {mapLinks.map((link, i) => (
                                                <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1 bg-brand-primary/10 px-2 py-1 rounded-lg">
                                                    <Icon className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></Icon>
                                                    {link.title || 'View on Maps'}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em]">Address Line 1</label>
                                        <input
                                            type="text"
                                            value={addressLine1}
                                            onChange={(e) => setAddressLine1(e.target.value)}
                                            className="w-full bg-dark-bg border border-dark-border rounded-2xl p-4 text-light-text focus:ring-2 focus:ring-brand-primary outline-none font-bold shadow-inner"
                                            placeholder="House No, Street Name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em]">Area / L2</label>
                                            <input
                                                type="text"
                                                value={addressLine2}
                                                onChange={(e) => setAddressLine2(e.target.value)}
                                                className="w-full bg-dark-bg border border-dark-border rounded-2xl p-4 text-light-text focus:ring-2 focus:ring-brand-primary outline-none font-bold shadow-inner"
                                                placeholder="Apt/Suite"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-medium-text mb-2 uppercase tracking-[0.2em]">City</label>
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full bg-dark-bg border border-dark-border rounded-2xl p-4 text-light-text focus:ring-2 focus:ring-brand-primary outline-none font-bold shadow-inner"
                                                placeholder="Dublin"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

        <div className="p-5 border-t border-dark-border bg-dark-bg/20 flex gap-4">
            <button onClick={onCancel} className="flex-1 py-4 bg-dark-border hover:bg-dark-border/80 text-light-text font-black rounded-2xl transition-all uppercase tracking-widest text-xs active:scale-95">
                Cancel
            </button>
            <button onClick={handleConfirm} className="flex-2 py-4 bg-brand-primary hover:bg-brand-secondary text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs active:scale-95">
                {initialDetails ? 'Update Details' : 'Confirm Order'}
            </button>
        </div>
      </div>
    </div>
  );
};
