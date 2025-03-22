import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';

import OthersForm from './Others';
import GoalForm from './Goal';

export default function TabsVertical() {
    const [value, setValue] = React.useState(0);
    // const navigate = useNavigate();

    // useEffect(() => {
    //     if (value === 0) {
    //         navigate('/home/others');
    //     } else if (value === 1) {
    //         navigate('/home/goal');
    //     }
    // }, [value, navigate]);

    return (
      <Tabs
        aria-label="Vertical tabs"
        orientation="vertical"
        sx={{ minWidth: 300, height: '100vh', color: '#ffffff', padding: '0px' }}
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
      >
        <TabList sx={{ backgroundColor: "#2A313A" }}>
          <Tab sx={{ padding: '15px', color: "#ffffff", '&.Mui-selected': { color: '#ffffff', backgroundColor: '#3A404C' } }}>Linear Programming</Tab>
          <Tab sx={{ padding: '15px', color: "#ffffff", '&.Mui-selected': { color: '#ffffff', backgroundColor: '#3A404C' } }}>Goal Programming</Tab>
        </TabList>
        <TabPanel value={0} sx={{ padding: '0px' }}>
            <OthersForm />
        </TabPanel>
        <TabPanel value={1} sx={{ padding: '0px' }}>
            <GoalForm />
        </TabPanel>
      </Tabs>
    );
}
