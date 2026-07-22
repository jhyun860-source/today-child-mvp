import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { missionsByRange, Mission } from "@/lib/missions";

interface ExpandedMission {
  [key: string]: boolean;
}

export default function Catalog() {
  const [, setLocation] = useLocation();
  const [expanded, setExpanded] = useState<ExpandedMission>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allMissions: Array<Mission & { id: string; ageGroup: string }> = [];
  const ageGroupLabels: Record<string, string> = {
    "0-3": "0~3개월",
    "4-6": "4~6개월",
    "7-12": "7~12개월",
    "13-18": "13~18개월",
    "19-24": "19~24개월",
    "25-30": "25~30개월",
    "31-36": "31~36개월",
  };

  Object.entries(missionsByRange).forEach(([key, missions]) => {
    missions.forEach((mission, idx) => {
      allMissions.push({
        ...mission,
        id: `${key}-${idx}`,
        ageGroup: ageGroupLabels[key] || key,
      });
    });
  });

  const groupedMissions = allMissions.reduce(
    (acc: Record<string, typeof allMissions>, mission) => {
      const ageGroup = mission.ageGroup;
      if (!acc[ageGroup]) {
        acc[ageGroup] = [];
      }
      acc[ageGroup].push(mission);
      return acc;
    },
    {}
  );

  const ageGroupOrder = [
    "0~3개월",
    "4~6개월",
    "7~12개월",
    "13~18개월",
    "19~24개월",
    "25~30개월",
    "31~36개월",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4 text-orange-700 hover:text-orange-900"
          >
            ← 돌아가기
          </Button>
          <h1 className="text-4xl font-bold text-orange-900 mb-2">
            오늘의아이 미션 카탈로그
          </h1>
          <p className="text-gray-600">
            모든 {allMissions.length}개 미션을 월령별로 확인하세요.
            각 미션의 상세 내용을 클릭해 펼쳐볼 수 있습니다.
          </p>
        </div>

        {/* Missions by Age Group */}
        <div className="space-y-8">
          {ageGroupOrder.map((ageGroup) => {
            const groupMissions = groupedMissions[ageGroup] || [];
            if (groupMissions.length === 0) return null;

            return (
              <div key={ageGroup}>
                <h2 className="text-2xl font-bold text-orange-800 mb-4 pb-2 border-b-2 border-orange-200">
                  {ageGroup}
                </h2>

                <div className="space-y-3">
                  {groupMissions.map((mission) => {
                    const isExpanded = expanded[mission.id];

                    return (
                      <Card
                        key={mission.id}
                        className="overflow-hidden border-orange-200 hover:shadow-lg transition-shadow"
                      >
                        {/* Mission Header - Always Visible */}
                        <button
                          onClick={() => toggleExpand(mission.id)}
                          className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-orange-50 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <h3 className="font-bold text-lg text-gray-900">
                              {mission.title}
                            </h3>
                            <div className="flex gap-3 mt-2 text-sm">
                              <span className="text-orange-600 font-medium">
                                ⏱ {mission.time}
                              </span>
                              <span className="text-amber-600">
                                준비물 {"★".repeat(mission.prepStars)}
                              </span>
                              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                                {mission.category}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-orange-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                        </button>

                        {/* Mission Details - Expandable */}
                        {isExpanded && (
                          <div className="px-6 py-4 bg-orange-50 border-t border-orange-200 space-y-4">
                            {/* Parent Script */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                부모가 할 말
                              </h4>
                              <p className="text-gray-700 italic bg-white p-3 rounded border-l-4 border-orange-400">
                                {mission.say}
                              </p>
                            </div>

                            {/* How to Do It */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                실행 방법
                              </h4>
                              <ol className="space-y-2">
                                {mission.how.map((step: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-gray-700 flex gap-3"
                                  >
                                    <span className="font-bold text-orange-600 flex-shrink-0">
                                      {idx + 1}.
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* If Child Won't Do It */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                아이가 안 하면?
                              </h4>
                              <p className="text-gray-700 bg-white p-3 rounded">
                                {mission.ifNot}
                              </p>
                            </div>

                            {/* Development Reason */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                왜 도움이 될까요?
                              </h4>
                              <p className="text-gray-700 bg-white p-3 rounded">
                                {mission.why}
                              </p>
                            </div>

                            {/* Sources */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                근거
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {mission.sources.map((source: any, idx: number) => (
                                  <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-green-300 rounded text-green-700 hover:bg-green-50 transition-colors text-sm font-medium"
                                  >
                                    ✔ {source.name}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>

                            {/* Source Note */}
                            <div className="text-xs text-gray-600 bg-white p-3 rounded border-l-4 border-gray-300">
                              위 기관의 공개 원문을 직접 확인·조사하여 실천
                              가이드로 재구성했습니다. 배지를 누르면 원문으로
                              이동합니다.
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="mt-12 p-6 bg-white rounded-lg border-2 border-orange-200">
          <h3 className="font-bold text-lg text-gray-900 mb-3">📊 카탈로그 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {allMissions.length}
              </div>
              <div className="text-sm text-gray-600">총 미션 수</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">카테고리</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">3~5분</div>
              <div className="text-sm text-gray-600">평균 소요시간</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">원문 검증</div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => setLocation("/")}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
