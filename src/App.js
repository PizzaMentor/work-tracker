import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';

const WorkTracker = () => {
  // Initialize state from localStorage
  const [selectedDate, setSelectedDate] = useState(null);
  const [workLogs, setWorkLogs] = useState(() => {
    const saved = localStorage.getItem('workLogs');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requirements, setRequirements] = useState(() => {
    const saved = localStorage.getItem('requirements');
    return saved ? JSON.parse(saved) : [];
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('workLogs', JSON.stringify(workLogs));
  }, [workLogs]);

  useEffect(() => {
    localStorage.setItem('requirements', JSON.stringify(requirements));
  }, [requirements]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentMonth);
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-4"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const hasEntry = workLogs[dateString];
      const hasExtra = hasEntry?.extraWork && !isRequiredWork(hasEntry.extraWork);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateString)}
          className={`p-4 border cursor-pointer hover:bg-gray-100 ${
            hasEntry ? 'bg-blue-50' : ''
          } ${hasExtra ? 'border-l-4 border-l-green-500' : ''}`}
        >
          <div className="text-center">
            <div>{day}</div>
            {hasEntry && (
              <div className="text-xs text-blue-600">
                {workLogs[dateString].hours} hrs
              </div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const changeMonth = (increment) => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + increment)));
  };

  const handleAddRequirement = (e) => {
    e.preventDefault();
    const requirement = e.target.requirement.value.trim();
    if (requirement) {
      setRequirements([...requirements, requirement]);
      e.target.reset();
    }
  };

  const handleRemoveRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const isRequiredWork = (work) => {
    return requirements.some(req => 
      work.toLowerCase().includes(req.toLowerCase())
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hours = e.target.hours.value;
    const extraWork = e.target.extraWork.value;

    setWorkLogs({
      ...workLogs,
      [selectedDate]: {
        hours,
        extraWork
      }
    });

    e.target.reset();
    setSelectedDate(null);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Work Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddRequirement} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                name="requirement"
                placeholder="Add a work requirement..."
                className="flex-1 p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </form>
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{req}</span>
                <button
                  onClick={() => handleRemoveRequirement(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
        <CardTitle className="flex items-center justify-between" as="h2">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Work Time Tracker
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeMonth(-1)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <span className="text-lg">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center font-medium">
                {day}
              </div>
            ))}
            {generateCalendarDays()}
          </div>

          {selectedDate && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">
                Log Hours for {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    name="hours"
                    step="0.5"
                    defaultValue={workLogs[selectedDate]?.hours}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Work Description
                  </label>
                  <textarea
                    name="extraWork"
                    defaultValue={workLogs[selectedDate]?.extraWork}
                    className="w-full p-2 border rounded"
                    rows="3"
                    placeholder="Describe the work done today..."
                  ></textarea>
                  {workLogs[selectedDate]?.extraWork && (
                    <div className="mt-2 text-sm">
                      {isRequiredWork(workLogs[selectedDate].extraWork) ? (
                        <span className="text-blue-600">✓ This work matches your requirements</span>
                      ) : (
                        <span className="text-green-600">★ Extra work identified!</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkTracker;