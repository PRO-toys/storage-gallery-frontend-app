// src\pages\role\admin\reports\ReportAnalytics.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../../../components/navbar/Navbar';
import config from '../../../../config/config.json';

interface GARealtimeEvent {
  minutesAgo: string;
  eventName: string;
  eventCount: number;
}

interface GADailyEvent {
  date: string;
  eventName: string;
  eventCount: number;
}

const ReportAnalytics: React.FC = () => {
  const [realtimeAll, setRealtimeAll] = useState<GARealtimeEvent[]>([]);
  const [realtimeTarget, setRealtimeTarget] = useState<GARealtimeEvent[]>([]);
  const [dailyData, setDailyData] = useState<GADailyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('2025-07-01');
  const [endDate, setEndDate] = useState<string>('2025-07-07');

  useEffect(() => {
    fetchRealtimeAnalytics();
    fetchDailyAnalytics(startDate, endDate);
  }, []);

  const fetchRealtimeAnalytics = async () => {
    try {
      const response = await axios.get(`${config.URL_BACKEND}/api/role/user/analytics/google/analytics/realtime`);
      setRealtimeAll(response.data.data.allEvents || []);
      setRealtimeTarget(response.data.data.targetEvents || []);
    } catch (error) {
      console.error('Error fetching realtime analytics:', error);
    }
  };

  const fetchDailyAnalytics = async (start: string, end: string) => {
    try {
      const response = await axios.get(
        `${config.URL_BACKEND}/api/role/user/analytics/google/analytics/daily?start=${start}&end=${end}`
      );
      setDailyData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching daily analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRealtimeEvent = (title: string, events: GARealtimeEvent[]) => (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
      {events.length === 0 ? (
        <p className="text-white">ไม่มีข้อมูล Event</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800">{event.eventName}</h3>
              <p className="text-gray-600">ภายใน {event.minutesAgo} นาทีที่ผ่านมา</p>
              <p className="text-blue-600 font-bold text-xl">{event.eventCount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDailyTable = () => (
    <div className="mt-10 bg-white p-4 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">📅 Daily Analytics Report</h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">📆 วันที่</th>
              <th className="px-4 py-2 border-b">🎯 Event</th>
              <th className="px-4 py-2 border-b">🔢 จำนวน</th>
            </tr>
          </thead>
          <tbody>
            {dailyData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{item.date}</td>
                <td className="px-4 py-2 border-b">{item.eventName}</td>
                <td className="px-4 py-2 border-b font-bold text-blue-700">{item.eventCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mt-10">Report: Google Analytics (GA4)</h1>

        {loading ? (
          <p className="text-white mt-8">กำลังโหลดข้อมูล...</p>
        ) : (
          <>
            {renderRealtimeEvent('🎯 Target Events (Realtime)', realtimeTarget)}
            {renderRealtimeEvent('📊 All Events (Realtime)', realtimeAll)}
            {renderDailyTable()}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportAnalytics;
