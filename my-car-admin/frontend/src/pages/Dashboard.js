import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Col, List, Row, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import { getStatsOverview, getStatsTopContent, getStatsTrend } from "../services/stats";
export default function DashboardPage() {
    const [overview, setOverview] = useState({
        totalUsers: 0,
        totalWallpapers: 0,
        totalSounds: 0,
        todayViews: 0,
        todayDownloads: 0,
        todayNewUsers: 0,
        viewsGrowth: 0
    });
    const [trend, setTrend] = useState({
        dates: [],
        views: [],
        downloads: [],
        newUsers: []
    });
    const [topContent, setTopContent] = useState({
        wallpapers: [],
        sounds: []
    });
    useEffect(() => {
        getStatsOverview().then(setOverview).catch(() => undefined);
        getStatsTrend(7).then(setTrend).catch(() => undefined);
        getStatsTopContent(5).then(setTopContent).catch(() => undefined);
    }, []);
    return (_jsxs("div", { children: [_jsx(Typography.Title, { level: 3, children: "\u6570\u636E\u770B\u677F" }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "\u603B\u7528\u6237", value: overview.totalUsers }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "\u603B\u58C1\u7EB8", value: overview.totalWallpapers }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "\u603B\u97F3\u6548", value: overview.totalSounds }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "\u4ECA\u65E5\u8BBF\u95EE", value: overview.todayViews, suffix: `(${overview.viewsGrowth}%)` }) }) })] }), _jsxs(Row, { gutter: 16, style: { marginTop: 16 }, children: [_jsx(Col, { span: 12, children: _jsx(Card, { title: "\u8FD17\u65E5\u8D8B\u52BF", children: _jsx(List, { dataSource: trend.dates.map((date, idx) => ({
                                    date,
                                    views: trend.views[idx] || 0,
                                    downloads: trend.downloads[idx] || 0,
                                    newUsers: trend.newUsers[idx] || 0
                                })), renderItem: (item) => (_jsxs(List.Item, { children: [item.date, " | \u6D4F\u89C8: ", item.views, " | \u4E0B\u8F7D: ", item.downloads, " | \u65B0\u589E\u7528\u6237: ", item.newUsers] })) }) }) }), _jsx(Col, { span: 12, children: _jsxs(Card, { title: "\u70ED\u95E8\u5185\u5BB9 TOP5", children: [_jsx(Typography.Text, { strong: true, children: "\u58C1\u7EB8" }), _jsx(List, { size: "small", dataSource: topContent.wallpapers, renderItem: (item) => _jsxs(List.Item, { children: [item.title, "\uFF08\u70ED\u5EA6 ", item.hotScore, "\uFF09"] }) }), _jsx(Typography.Text, { strong: true, children: "\u97F3\u6548" }), _jsx(List, { size: "small", dataSource: topContent.sounds, renderItem: (item) => _jsxs(List.Item, { children: [item.title, "\uFF08\u70ED\u5EA6 ", item.hotScore, "\uFF09"] }) })] }) })] })] }));
}
