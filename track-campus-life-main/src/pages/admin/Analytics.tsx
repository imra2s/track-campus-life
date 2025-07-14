
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Users, 
  TrendingUp,
  Calendar,
  BookOpen,
  FileText,
  Bell,
  Clock
} from 'lucide-react';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch various analytics data
      const [
        studentsData,
        attendanceData,
        syllabusData,
        pyqsData,
        noticesData
      ] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('syllabus').select('*'),
        supabase.from('pyqs').select('*'),
        supabase.from('notices').select('*')
      ]);

      // Calculate attendance statistics
      const totalAttendance = attendanceData.data?.length || 0;
      const presentCount = attendanceData.data?.filter(a => a.status === 'present').length || 0;
      const absentCount = attendanceData.data?.filter(a => a.status === 'absent').length || 0;
      const lateCount = attendanceData.data?.filter(a => a.status === 'late').length || 0;
      
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      // Calculate recent activity
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentStudents = studentsData.data?.filter(s => 
        new Date(s.created_at) >= lastWeek
      ).length || 0;

      const activeStudents = studentsData.data?.filter(s => 
        s.last_seen && new Date(s.last_seen) >= lastWeek
      ).length || 0;

      setAnalytics({
        totalStudents: studentsData.data?.length || 0,
        totalAttendance,
        attendanceRate,
        presentCount,
        absentCount,
        lateCount,
        totalSyllabus: syllabusData.data?.length || 0,
        totalPyqs: pyqsData.data?.length || 0,
        totalNotices: noticesData.data?.length || 0,
        recentStudents,
        activeStudents
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system performance and student engagement
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.recentStudents} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalAttendance} total records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Items</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalSyllabus + analytics.totalPyqs}
            </div>
            <p className="text-xs text-muted-foreground">
              Syllabus & PYQs uploaded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of attendance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Present</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success"
                      style={{ 
                        width: analytics.totalAttendance > 0 
                          ? `${(analytics.presentCount / analytics.totalAttendance) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">
                    {analytics.presentCount}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Absent</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive"
                      style={{ 
                        width: analytics.totalAttendance > 0 
                          ? `${(analytics.absentCount / analytics.totalAttendance) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">
                    {analytics.absentCount}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Late</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-warning"
                      style={{ 
                        width: analytics.totalAttendance > 0 
                          ? `${(analytics.lateCount / analytics.totalAttendance) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">
                    {analytics.lateCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Statistics
            </CardTitle>
            <CardDescription>
              Overview of uploaded content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Syllabus Files</span>
                </div>
                <span className="text-2xl font-bold">{analytics.totalSyllabus}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">PYQ Files</span>
                </div>
                <span className="text-2xl font-bold">{analytics.totalPyqs}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Notices</span>
                </div>
                <span className="text-2xl font-bold">{analytics.totalNotices}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
