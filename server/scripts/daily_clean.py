import datetime
from pace.models import AttendanceSpan

from logging

logger = logging.getLogger(__name__)

def end_student_days(self):
    # first find all attendance spans that were not ended at the end of the day
    spans = AttendanceSpan.objects.filter(time_out__isnull=True)

    # set a hard time-out time to 3pm for each of them
    logger.info('Checking out %d students' % spans.count())

    for span in spans:
        span.time_out = datetime.time(15)
        span.save()

    # then go in and create records for any periods never created (up to 10)
    for span in spans:
        # get all period numbers that DO have records
        tracked_periods = [record.period for record in PeriodicRecord.objects.filter(date=span.date, student=span.student)]

        period_numbers_created = []
        # counting back from 10, create new records for any that don't exist
        # (but stop this process at the first sign that datat was being tracked)
        for missing_period in range(10, 0, -1):
            if missing_period in tracked_periods:
                break
            else:
                # PeriodicRecord.objects.create(date=span.date, period=missing_period, student=span.student)
                period_numbers_created.append(missing_period)

        if len(period_numbers_created) > 0:
            print u'Created periods %s for %s on %s' % (unicode(period_numbers_created), unicode(span.student), span.date.strftime('%Y%m%d'))



def remove_duplicate_period_records(self):
    pd_buckets = {}
    for pd in PeriodicRecord.objects.all():
        classroom = pd.student.classroom if pd.student else '----'
        key = '%s-%s-%s-%s' % (classroom, str(pd.student.id), pd.date.strftime('%Y%m%d'), str(pd.period))
        bucket = pd_buckets.setdefault(key, [])
        bucket.append(pd)

    for k, pds in pd_buckets.items():
      if len(pds) > 1:
        # find the minimum point value in each category
        min_bs = 2
        min_cw = 2
        min_fd = 2
        min_kw = 2
        for pd in pds:
          min_bs = min([pd.be_safe_points for pd in pds])
          min_cw = min([pd.complete_work_points for pd in pds])
          min_fd = min([pd.follow_directions_points for pd in pds])
          min_kw = min([pd.kind_words_points for pd in pds])
        logger.info('\n' + str(k))

        # set the canonical period
        pd = pds[0]
        pd.be_safe_points = min_bs
        pd.complete_work_points = min_cw
        pd.follow_directions_points = min_fd
        pd.kind_words_points = min_kw
        pd.save()
        logger.info('  keeping  %d %d %d %d' % (pd.be_safe_points, pd.complete_work_points, pd.follow_directions_points, pd.kind_words_points))

        # erase all other periods
        for bad_pd in pds[1:]:
          logger.info('  deleting %d %d %d %d' % (bad_pd.be_safe_points, bad_pd.complete_work_points, bad_pd.follow_directions_points, bad_pd.kind_words_points))
          bad_pd.delete()


if __name__ == '__main__':
    close_attendance_spans()
    remove_duplicate_period_records()
