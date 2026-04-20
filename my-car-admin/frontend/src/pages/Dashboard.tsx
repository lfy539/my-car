import { Card, Col, List, Row, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import { getStatsOverview, getStatsTopContent, getStatsTrend } from "../services/stats";
import type { StatsOverview, StatsTopContent, StatsTrend } from "../types";

export default function DashboardPage() {
  const [overview, setOverview] = useState<StatsOverview>({
    totalUsers: 0,
    totalWallpapers: 0,
    totalSounds: 0,
    todayViews: 0,
    todayDownloads: 0,
    todayNewUsers: 0,
    viewsGrowth: 0
  });
  const [trend, setTrend] = useState<StatsTrend>({
    dates: [],
    views: [],
    downloads: [],
    newUsers: []
  });
  const [topContent, setTopContent] = useState<StatsTopContent>({
    wallpapers: [],
    sounds: []
  });

  useEffect(() => {
    getStatsOverview().then(setOverview).catch(() => undefined);
    getStatsTrend(7).then(setTrend).catch(() => undefined);
    getStatsTopContent(5).then(setTopContent).catch(() => undefined);
  }, []);

  return (
    <div>
      <Typography.Title level={3}>数据看板</Typography.Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="总用户" value={overview.totalUsers} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总壁纸" value={overview.totalWallpapers} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总音效" value={overview.totalSounds} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日访问" value={overview.todayViews} suffix={`(${overview.viewsGrowth}%)`} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="近7日趋势">
            <List
              dataSource={trend.dates.map((date, idx) => ({
                date,
                views: trend.views[idx] || 0,
                downloads: trend.downloads[idx] || 0,
                newUsers: trend.newUsers[idx] || 0
              }))}
              renderItem={(item) => (
                <List.Item>
                  {item.date} | 浏览: {item.views} | 下载: {item.downloads} | 新增用户: {item.newUsers}
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门内容 TOP5">
            <Typography.Text strong>壁纸</Typography.Text>
            <List
              size="small"
              dataSource={topContent.wallpapers}
              renderItem={(item) => <List.Item>{item.title}（热度 {item.hotScore}）</List.Item>}
            />
            <Typography.Text strong>音效</Typography.Text>
            <List
              size="small"
              dataSource={topContent.sounds}
              renderItem={(item) => <List.Item>{item.title}（热度 {item.hotScore}）</List.Item>}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
