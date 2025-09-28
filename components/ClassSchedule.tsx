import React, { useRef } from 'react';
import type { ClassScheduleEntry } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';

interface ClassScheduleProps {
    schedule: ClassScheduleEntry[];
    onScheduleUpdate: (newSchedule: ClassScheduleEntry[]) => void;
}

const sortSchedule = (schedule: ClassScheduleEntry[]): ClassScheduleEntry[] => {
    const dayOrderMap: { [key: string]: number } = { 'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5, 'S': 6, 'U': 7 };
    
    const timeToMinutes = (timeStr: string): number => {
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s(AM|PM)/);
        if (!timeMatch) return 9999;
        let [, hoursStr, minutesStr, ampm] = timeMatch;
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0; // Midnight case
        return hours * 60 + minutes;
    };

    return [...schedule].sort((a, b) => {
        const firstDayA = a.days.charAt(0);
        const firstDayB = b.days.charAt(0);
        const dayOrderA = dayOrderMap[firstDayA] || 99;
        const dayOrderB = dayOrderMap[firstDayB] || 99;

        if (dayOrderA !== dayOrderB) {
            return dayOrderA - dayOrderB;
        }

        const startTimeA = a.time.split(' - ')[0];
        const startTimeB = b.time.split(' - ')[0];
        const minutesA = timeToMinutes(startTimeA);
        const minutesB = timeToMinutes(startTimeB);

        return minutesA - minutesB;
    });
};

const parseIcs = (icsContent: string): ClassScheduleEntry[] => {
    const schedule: ClassScheduleEntry[] = [];
    
    // 1. Unfold multi-line properties. This handles CRLF and LF line endings followed by a space or tab.
    const unfoldedContent = icsContent.replace(/\r?\n[ \t]/g, '');

    // 2. Use a regex to find all VEVENT blocks. This is more reliable than splitting by BEGIN:VEVENT.
    const eventBlocks = unfoldedContent.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

    const dayMap: { [key: string]: string } = {
        'MO': 'M', 'TU': 'T', 'WE': 'W', 'TH': 'R', 'FR': 'F', 'SA': 'S', 'SU': 'U'
    };

    const timeFormatter = (timeStr: string): string => {
        // Remove Z if present, as it indicates UTC but we are just formatting time of day
        const cleanTimeStr = timeStr.endsWith('Z') ? timeStr.slice(0, -1) : timeStr;
        if (!cleanTimeStr || cleanTimeStr.length < 4) return '';
        const hours = parseInt(cleanTimeStr.substring(0, 2), 10);
        const minutes = cleanTimeStr.substring(2, 4);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12; // Converts 0 to 12 for 12 AM, and 12 to 12 for 12 PM.
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    eventBlocks.forEach((block, index) => {
        // 3. Split block into lines and build a key-value map of the event properties.
        const lines = block.split(/\r\n|\n/).filter(line => line.trim() !== '');
        const eventData: { [key: string]: string } = {};
        lines.forEach(line => {
            const separatorIndex = line.indexOf(':');
            if (separatorIndex === -1) return;
            
            const key = line.substring(0, separatorIndex);
            const value = line.substring(separatorIndex + 1).trim();
            
            if (key && value) {
                const keyWithoutParams = key.split(';')[0];
                eventData[keyWithoutParams] = value;
            }
        });

        // 4. Extract data if all required fields are present and it's a weekly event.
        if (eventData.RRULE && eventData.RRULE.includes('FREQ=WEEKLY') && eventData.DTSTART && eventData.DTEND && eventData.SUMMARY) {
            const bydayMatch = eventData.RRULE.match(/BYDAY=([A-Z,]+)/);
            if (!bydayMatch) return; // Skip if no BYDAY is found

            const days = bydayMatch[1].split(',').map(day => dayMap[day] || '').join('');

            const startTimeStr = (eventData.DTSTART.split('T')[1] || '').trim();
            const endTimeStr = (eventData.DTEND.split('T')[1] || '').trim();
            
            const time = `${timeFormatter(startTimeStr)} - ${timeFormatter(endTimeStr)}`;
            
            // Gracefully handle summary formats
            const summaryParts = eventData.SUMMARY.split(' - ');
            const courseCode = summaryParts.length > 1 ? summaryParts[0].trim() : eventData.SUMMARY;
            const courseName = summaryParts.length > 1 ? summaryParts.slice(1).join(' - ').trim() : 'Class';

            schedule.push({
                id: `ics_${index}_${courseCode.replace(/\s/g, '')}`,
                courseCode,
                courseName,
                days,
                time,
                location: eventData.LOCATION || 'N/A',
            });
        }
    });

    return schedule;
};


export const ClassSchedule: React.FC<ClassScheduleProps> = ({ schedule, onScheduleUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.name.toLowerCase().endsWith('.ics')) {
            if (file) alert("Please select a valid .ics calendar file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const icsContent = e.target?.result as string;
            if (icsContent) {
                try {
                    const newSchedule = parseIcs(icsContent);
                    
                    if (newSchedule.length > 0) {
                        const sortedSchedule = sortSchedule(newSchedule);
                        onScheduleUpdate(sortedSchedule);
                    } else {
                        alert("No weekly recurring classes were found in the selected .ics file.");
                    }
                } catch (error) {
                    console.error("Error parsing .ics file:", error);
                    alert("Failed to parse the .ics file. Please ensure it is a valid calendar file and try again.");
                }
            }
        };
        reader.onerror = () => {
            alert("Failed to read the file.");
        };
        reader.readAsText(file);

        // Reset file input to allow re-uploading the same file
        event.target.value = '';
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".ics,text/calendar"
                className="hidden"
            />
            <h3 className="text-xl font-bold text-brand-blue">Your Class Schedule</h3>
            <div className="space-y-4">
                {schedule && schedule.length > 0 ? (
                    schedule.map(item => (
                        <div key={item.id} className="p-4 bg-light-bg rounded-lg border border-gray-200">
                            <div className="font-bold text-gray-800 flex items-center gap-2">
                               <AcademicCapIcon className="h-5 w-5 text-brand-blue" /> 
                               {item.courseCode} - {item.courseName}
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    <span>{item.days}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 text-gray-500" />
                                    <span>{item.time}</span>
                                </p>
                                 <p className="flex items-center gap-2">
                                    <LocationMarkerIcon className="h-4 w-4 text-gray-500" />
                                    <span>{item.location}</span>
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
                        <p className="text-gray-600">Your class schedule is empty.</p>
                        <p className="text-sm text-gray-500 mt-1">Import your schedule from an .ics file to get started.</p>
                    </div>
                )}
            </div>
             <button 
                onClick={triggerFileSelect}
                className="w-full mt-2 bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
                Import Schedule (.ics)
            </button>
        </div>
    );
};
