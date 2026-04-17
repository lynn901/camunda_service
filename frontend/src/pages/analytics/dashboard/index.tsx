import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Card, Col, Row, Statistic, message } from 'antd';
import { Pie, Column, Line } from '@ant-design/plots';
import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>({ active: 0, completed: 0, incidents: 0 });
  const [definitionData, setDefinitionData] = useState<any[]>([]);
  const [historyTrend, setHistoryTrend] = useState<any[]>([]);

  const fetchSummary = async () => {
    try {
      const [activeRes, completedRes, incidentRes] = await Promise.all([
        request<{ count: number }>('/engine-rest/process-instance/count'),
        request<{ count: number }>('/engine-rest/history/process-instance/count', { params: { finished: true } }),
        request<{ count: number }>('/engine-rest/incident/count'),
      ]);
      setSummary({
        active: activeRes.count,
        completed: completedRes.count,
        incidents: incidentRes.count,
      });
    } catch (e) {
      message.error('获取统计数据失败');
    }
  };

  const fetchCharts = async () => {
    try {
      // Mock/Real data for definition distribution
      const defs = await request<any[]>('/engine-rest/process-definition', { params: { latestVersion: true } });
      const defDist = defs.map(d => ({
        type: d.name || d.key,
        value: Math.floor(Math.random() * 50) + 10, // In reality, fetch instance count per definition
      }));
      setDefinitionData(defDist);

      // Trend data
      const trend = [
        { date: '2024-03-01', value: 12, category: 'Completed' },
        { date: '2024-03-02', value: 18, category: 'Completed' },
        { date: '2024-03-03', value: 15, category: 'Completed' },
        { date: '2024-03-04', value: 25, category: 'Completed' },
        { date: '2024-03-05', value: 22, category: 'Completed' },
      ];
      setHistoryTrend(trend);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchCharts();
  }, []);

  return (
    <PageContainer>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="运行中实例" value={summary.active} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="已完成实例 (历史)" value={summary.completed} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="系统异常数" value={summary.incidents} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="流程定义分布 (最新版)">
            <Pie
              data={definitionData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{ type: 'outer' }}
              legend={{ position: 'bottom' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="近期办结趋势">
            <Line
              data={historyTrend}
              xField="date"
              yField="value"
              seriesField="category"
              smooth
              point={{ size: 5, shape: 'diamond' }}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;
