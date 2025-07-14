import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  FileText, 
  BookOpen, 
  Bell, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);

      if (profile?.role === 'student') {
        await fetchStudentDashboard();
      } else if (profile?.role === 'admin') {
        await fetchAdminDashboard();
      }

      // Fetch recent notices for all users
      const { data: notices } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentNotices(notices || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDashboard = async () => {
    if (!user) return;

    try {
      // Fetch student data
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setStudentData(student);

      if (student) {
        // Fetch attendance data
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', student.id);

        const totalClasses = attendance?.length || 0;
        const presentClasses = attendance?.filter(a => a.status === 'present').length || 0;
        const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

        setAttendanceData({
          total: totalClasses,
          present: presentClasses,
          percentage: attendancePercentage,
          recent: attendance?.slice(-5) || []
        });
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchAdminDashboard = async () => {
    try {
      // Fetch admin statistics
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: totalNotices } = await supabase
        .from('notices')
        .select('*', { count: 'exact', head: true });

      const { count: totalSyllabus } = await supabase
        .from('syllabus')
        .select('*', { count: 'exact', head: true });

      const { count: totalPyqs } = await supabase
        .from('pyqs')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalStudents: totalStudents || 0,
        totalNotices: totalNotices || 0,
        totalSyllabus: totalSyllabus || 0,
        totalPyqs: totalPyqs || 0
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success text-success-foreground';
      case 'absent': return 'bg-destructive text-destructive-foreground';
      case 'late': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'normal': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userProfile?.full_name}! 👋
        </h1>
        <p className="text-muted-foreground">
          {userProfile?.role === 'admin' ? 
            "Here's what's happening in your institution." : 
            "Here's your academic overview."
          }
        </p>
      </div>

      {userProfile?.role === 'student' && studentData && (
        <>
          {/* Student Profile Section */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Student Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-semibold">{studentData.student_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-semibold">{studentData.roll_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-semibold">{studentData.class}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Semester</p>
                  <p className="font-semibold">{studentData.semester}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Attendance Overview
              </CardTitle>
              <CardDescription>Your attendance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Attendance</span>
                  <span className="text-2xl font-bold text-primary">
                    {attendanceData?.percentage || 0}%
                  </span>
                </div>
                <Progress value={attendanceData?.percentage || 0} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-success">{attendanceData?.present || 0}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{(attendanceData?.total || 0) - (attendanceData?.present || 0)}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{attendanceData?.total || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Classes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          {attendanceData?.recent?.length > 0 && (
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceData.recent.map((record: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{record.subject || 'General'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {userProfile?.role === 'admin' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Registered students
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notices</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotices}</div>
              <p className="text-xs text-muted-foreground">
                Published notices
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Syllabus Files</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSyllabus}</div>
              <p className="text-xs text-muted-foreground">
                Uploaded files
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PYQ Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPyqs}</div>
              <p className="text-xs text-muted-foreground">
                Question papers
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Notices */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Recent Notices
          </CardTitle>
          <CardDescription>Latest announcements and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotices.length > 0 ? (
            <div className="space-y-4">
              {recentNotices.map((notice) => (
                <div key={notice.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{notice.title}</h4>
                      <Badge className={getPriorityColor(notice.priority)} variant="secondary">
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notice.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notices available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;