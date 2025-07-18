import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Award } from 'lucide-react';
import { V_GRADES, FONT_GRADES } from '../../types/boulder';
import { convertVToFont, convertFontToV } from '../../utils/gradeUtils';

interface GradeVote {
  id: string;
  userId: string;
  username: string;
  vGrade: string;
  fontGrade: string;
  comment?: string;
  timestamp: Date;
  helpfulVotes: number;
  userHasVotedHelpful: boolean;
  overallRating: number;
  recommend: boolean;
}

interface UnifiedGradingRatingProps {
  boulderId: string;
  submitterGrade: {
    vGrade?: string;
    fontGrade?: string;
  };
  communityGrade: {
    vGrade?: string;
    fontGrade?: string;
    averageRating: number;
    totalVotes: number;
  };
  userVote?: GradeVote;
  onVoteSubmit: (vote: Omit<GradeVote, 'id' | 'timestamp' | 'helpfulVotes' | 'userHasVotedHelpful'>) => void;
}

// Mock data for demonstration
const mockVotes: GradeVote[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'ClimberPro',
    vGrade: 'V4',
    fontGrade: '6a',
    comment: 'Felt solid V4. The crux move to the sloper is definitely the hardest part.',
    timestamp: new Date('2024-01-10'),
    helpfulVotes: 12,
    userHasVotedHelpful: false,
    overallRating: 4,
    recommend: true
  },
  {
    id: '2',
    userId: 'user2',
    username: 'BoulderBeast',
    vGrade: 'V5',
    fontGrade: '6b',
    comment: 'I think this is more like V5. The holds are smaller than they appear in photos.',
    timestamp: new Date('2024-01-12'),
    helpfulVotes: 8,
    userHasVotedHelpful: true,
    overallRating: 3,
    recommend: true
  },
  {
    id: '3',
    userId: 'user3',
    username: 'SlopeMaster',
    vGrade: 'V4',
    fontGrade: '6a',
    comment: 'Classic V4. Perfect for warming up before harder projects.',
    timestamp: new Date('2024-01-15'),
    helpfulVotes: 15,
    userHasVotedHelpful: false,
    overallRating: 5,
    recommend: true
  }
];

export default function UnifiedGradingRating({ 
  boulderId, 
  submitterGrade, 
  communityGrade, 
  userVote, 
  onVoteSubmit 
}: UnifiedGradingRatingProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedVGrade, setSelectedVGrade] = useState<string>('');
  const [selectedFontGrade, setSelectedFontGrade] = useState<string>('');
  const [comment, setComment] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [recommend, setRecommend] = useState(true);
  const [votes, setVotes] = useState<GradeVote[]>(mockVotes);

  const handleVGradeChange = (vGrade: string) => {
    setSelectedVGrade(vGrade);
    // Auto-convert to Font grade
    const correspondingFont = convertVToFont(vGrade);
    setSelectedFontGrade(correspondingFont);
  };

  const handleFontGradeChange = (fontGrade: string) => {
    setSelectedFontGrade(fontGrade);
    // Auto-convert to V grade
    const correspondingV = convertFontToV(fontGrade);
    setSelectedVGrade(correspondingV);
  };

  const handleStarClick = (rating: number) => {
    setOverallRating(rating);
  };

  const handleSubmitVote = () => {
    if (!selectedVGrade || !selectedFontGrade || overallRating === 0) return;

    const newVote: GradeVote = {
      id: Date.now().toString(),
      userId: 'current-user',
      username: 'CurrentUser',
      vGrade: selectedVGrade,
      fontGrade: selectedFontGrade,
      comment: comment.trim() || undefined,
      timestamp: new Date(),
      helpfulVotes: 0,
      userHasVotedHelpful: false,
      overallRating,
      recommend
    };

    // Add the new vote to the votes list
    setVotes(prevVotes => [newVote, ...prevVotes]);

    // Call the parent callback
    onVoteSubmit({
      userId: 'current-user',
      username: 'CurrentUser',
      vGrade: selectedVGrade,
      fontGrade: selectedFontGrade,
      comment: comment.trim() || undefined,
      overallRating,
      recommend
    });

    setIsVoting(false);
    setSelectedVGrade('');
    setSelectedFontGrade('');
    setComment('');
    setOverallRating(0);
    setRecommend(true);
  };

  const handleHelpfulVote = (voteId: string, isHelpful: boolean) => {
    setVotes(prevVotes => 
      prevVotes.map(vote => {
        if (vote.id === voteId) {
          const delta = vote.userHasVotedHelpful ? -1 : (isHelpful ? 1 : 0);
          return {
            ...vote,
            helpfulVotes: vote.helpfulVotes + delta,
            userHasVotedHelpful: !vote.userHasVotedHelpful && isHelpful
          };
        }
        return vote;
      })
    );
  };

  const getGradeConsensus = () => {
    const vGradeCount: Record<string, number> = {};
    const fontGradeCount: Record<string, number> = {};

    votes.forEach(vote => {
      vGradeCount[vote.vGrade] = (vGradeCount[vote.vGrade] || 0) + 1;
      fontGradeCount[vote.fontGrade] = (fontGradeCount[vote.fontGrade] || 0) + 1;
    });

    const mostVotedV = Object.entries(vGradeCount).sort(([,a], [,b]) => b - a)[0];
    const mostVotedFont = Object.entries(fontGradeCount).sort(([,a], [,b]) => b - a)[0];

    return {
      vGrade: mostVotedV?.[0] || communityGrade.vGrade,
      fontGrade: mostVotedFont?.[0] || communityGrade.fontGrade,
      vConsensus: mostVotedV?.[1] || 0,
      fontConsensus: mostVotedFont?.[1] || 0
    };
  };

  const consensus = getGradeConsensus();

  return (
    <div className="space-y-6">
      {/* Grade Summary */}
      <Card className="climbing-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Grade Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submitter Grade */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">SUBMITTER GRADE</h3>
              <div className="flex justify-center space-x-2 mb-2">
                <Badge className="v-grade text-lg py-1">
                  {submitterGrade.vGrade || 'N/A'}
                </Badge>
                <Badge className="font-grade text-lg py-1">
                  {submitterGrade.fontGrade || 'N/A'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Original assessment</p>
            </div>

            {/* Community Consensus */}
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">COMMUNITY CONSENSUS</h3>
              <div className="flex justify-center space-x-2 mb-2">
                <Badge className="v-grade text-lg py-1">
                  {consensus.vGrade || 'N/A'}
                </Badge>
                <Badge className="font-grade text-lg py-1">
                  {convertVToFont(consensus.vGrade) || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-center items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{communityGrade.averageRating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({communityGrade.totalVotes} votes)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.max(consensus.vConsensus, consensus.fontConsensus)} climbers agree
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voting Section */}
      <Card className="climbing-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Rate This Boulder</span>
            </CardTitle>
            {!isVoting && !userVote && (
              <Button onClick={() => setIsVoting(true)}>
                Rate This Boulder
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {userVote ? (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="v-grade">{userVote.vGrade}</Badge>
                <Badge className="font-grade">{userVote.fontGrade}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{userVote.overallRating}/5</span>
                </div>
                <span className="text-sm text-muted-foreground">Your vote</span>
              </div>
              {userVote.comment && (
                <p className="text-sm">{userVote.comment}</p>
              )}
            </div>
          ) : isVoting ? (
            <div className="space-y-4">
              {/* Overall Rating */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Overall Rating</Label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="transition-colors"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleStarClick(star)}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoverRating || overallRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {overallRating > 0 ? `${overallRating}/5` : 'Click to rate'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">V-Scale Grade</label>
                  <Select value={selectedVGrade} onValueChange={handleVGradeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select V-grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {V_GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Font Scale Grade</label>
                  <Select value={selectedFontGrade} onValueChange={handleFontGradeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Font grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Would you recommend this boulder?</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant={recommend ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRecommend(true)}
                    className="flex items-center space-x-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Yes</span>
                  </Button>
                  <Button
                    type="button"
                    variant={!recommend ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRecommend(false)}
                    className="flex items-center space-x-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>No</span>
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts on the grade, moves, or conditions..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsVoting(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitVote}
                  disabled={!selectedVGrade || !selectedFontGrade || overallRating === 0}
                  className="boulder-gradient text-white"
                >
                  Submit Rating
                </Button>
              </div>

              {/* Rating Guidelines */}
              <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                <div className="font-medium mb-1">Rating Guidelines:</div>
                <div className="space-y-1">
                  <div>⭐ 1-2: Poor quality or dangerous</div>
                  <div>⭐ 3: Average, worth doing</div>
                  <div>⭐ 4: Great boulder, highly recommended</div>
                  <div>⭐ 5: World-class, must-do boulder</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Help the community by sharing your grade assessment and rating
              </p>
              <Button onClick={() => setIsVoting(true)}>
                Rate This Boulder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Votes */}
      <Card className="climbing-card">
        <CardHeader>
          <CardTitle>Community Ratings ({votes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {votes.map((vote) => (
              <div key={vote.id} className="border-l-2 border-primary/20 pl-4 py-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <span className="font-medium text-sm">{vote.username}</span>
                    <div className="flex space-x-1">
                      <Badge className="v-grade text-xs">{vote.vGrade}</Badge>
                      <Badge className="font-grade text-xs">{convertVToFont(vote.vGrade)}</Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{vote.overallRating}/5</span>
                    </div>
                    {vote.recommend && (
                      <ThumbsUp className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <Button 
                      variant={vote.userHasVotedHelpful ? "default" : "ghost"} 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => handleHelpfulVote(vote.id, true)}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {vote.helpfulVotes}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {vote.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {vote.comment && (
                  <p className="text-sm text-muted-foreground break-words">{vote.comment}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}