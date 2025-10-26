
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { exportPlayers, exportSessions, exportGameUses } from '../utils/export';
import Icon from '../components/Icon';

const SettingsView: React.FC = () => {
    const { settings, updateSettings, players, sessions, gameUses } = useAppContext();

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold">ตั้งค่า</h1>

            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">ค่าใช้จ่าย</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-300">สกุลเงิน</label>
                    <input
                        type="text"
                        value={settings.currency}
                        onChange={(e) => updateSettings({ currency: e.target.value })}
                        className="mt-1 w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">ค่าเข้าร่วมต่อคน</label>
                    <input
                        type="number"
                        value={settings.courtFee}
                        onChange={(e) => updateSettings({ courtFee: Number(e.target.value) })}
                        className="mt-1 w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">ราคาต่อลูก</label>
                    <input
                        type="number"
                        value={settings.shuttlePrice}
                        onChange={(e) => updateSettings({ shuttlePrice: Number(e.target.value) })}
                        className="mt-1 w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                    />
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                 <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">ฟีเจอร์</h2>
                  <div className="flex justify-between items-center">
                    <label htmlFor="enableAutoSelect" className="text-sm font-medium text-gray-300">เปิดใช้งานการเลือกอัตโนมัติ</label>
                    <input
                        id="enableAutoSelect"
                        type="checkbox"
                        checked={settings.enableAutoSelect}
                        onChange={(e) => updateSettings({ enableAutoSelect: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                 </div>
            </div>

             <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">จัดการข้อมูล</h2>
                <p className="text-sm text-gray-400">
                    ส่งออกข้อมูลทั้งหมดของคุณเป็นไฟล์ CSV ซึ่งสามารถเปิดได้ใน Google Sheets หรือโปรแกรมสเปรดชีตอื่นๆ สำหรับการสำรองข้อมูลหรือการวิเคราะห์
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button onClick={() => exportPlayers(players)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                        <Icon.Users className="w-5 h-5" />
                        <span>ผู้เล่น</span>
                    </button>
                    <button onClick={() => exportSessions(sessions)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                         <Icon.Clock className="w-5 h-5" />
                        <span>เซสชั่น</span>
                    </button>
                    <button onClick={() => exportGameUses(gameUses)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                         <Icon.Shuttle className="w-5 h-5" />
                        <span>เกม</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
