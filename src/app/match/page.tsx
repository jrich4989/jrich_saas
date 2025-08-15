// src/app/match/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  Clock,
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface MatchedUser {
  id: string;
  nickname: string;
  mbti: string;
  interests: string[];
  location: string;
  ageGroup: string;
  matchingRate: number;
}

interface MatchInfo {
  matchId: string;
  chatRoomId: string;
  expiresAt: string;
  partner: MatchedUser;
}

export default function MatchFoundPage({
  searchParams,
}: {
  searchParams: { matchId?: string };
}) {
  const router = useRouter();
  const matchId = searchParams?.matchId;

  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      router.push("/");
      return;
    }

    // 매칭 정보 조회
    fetchMatchInfo();

    // 축하 효과
    triggerCelebration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    if (!matchInfo) return;

    // 남은 시간 계산
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(matchInfo.expiresAt).getTime();
      const distance = expires - now;

      if (distance < 0) {
        setTimeRemaining("만료됨");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}시간 ${minutes}분 ${seconds}초`);
    }, 1000);

    return () => clearInterval(timer);
  }, [matchInfo]);

  const fetchMatchInfo = async () => {
    try {
      // TODO: 실제 API 호출
      // const response = await fetch(`/api/match/${matchId}`);
      // const data = await response.json();

      // 임시 데이터
      setTimeout(() => {
        setMatchInfo({
          matchId: matchId!,
          chatRoomId: "chat_" + matchId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          partner: {
            id: "user_456",
            nickname: "별빛러너",
            mbti: "ENFP",
            interests: ["운동", "여행", "카페투어", "독서"],
            location: "서울 강남구",
            ageGroup: "20대 후반",
            matchingRate: 87,
          },
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to fetch match info:", error);
      setLoading(false);
    }
  };

  const triggerCelebration = () => {
    // 컨페티 효과
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 500);
  };

  const handleStartChat = () => {
    if (matchInfo) {
      router.push(`/chat/${matchInfo.chatRoomId}`);
    }
  };

  const handleDeclineMatch = () => {
    // TODO: 매칭 거절 API 호출
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-pulse" />
          <p className="text-gray-600">매칭 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!matchInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">매칭 정보를 찾을 수 없습니다.</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 성공 메시지 */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              매칭 성공! 🎉
            </h1>
            <p className="text-gray-600">새로운 대화 상대를 찾았습니다</p>
          </div>

          {/* 매칭 상대 정보 */}
          <Card className="mb-6 border-2 border-purple-200 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>매칭 상대</CardTitle>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {matchInfo.partner.matchingRate}% 일치
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl">
                    {matchInfo.partner.nickname[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {matchInfo.partner.nickname}
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {matchInfo.partner.mbti}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{matchInfo.partner.ageGroup}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{matchInfo.partner.location}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">관심사</p>
                    <div className="flex flex-wrap gap-2">
                      {matchInfo.partner.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 시간 정보 */}
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-700">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-medium">대화 가능 시간</span>
                  </div>
                  <span className="font-bold text-amber-900">
                    {timeRemaining}
                  </span>
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  24시간 동안 대화할 수 있습니다. 시간이 지나면 자동으로
                  종료됩니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleStartChat}
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                대화 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleDeclineMatch}
                variant="outline"
                className="w-full"
              >
                다음 기회에
              </Button>
            </motion.div>
          </div>

          {/* 안내 사항 */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                대화 팁
              </h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• 서로를 존중하며 즐거운 대화를 나눠보세요</li>
                <li>• 개인정보는 신중하게 공유하세요</li>
                <li>• 불편한 상황이 발생하면 신고 기능을 이용해주세요</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
