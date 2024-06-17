import React from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement, Filler } from 'chart.js';
import { Chart, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    Filler
);


